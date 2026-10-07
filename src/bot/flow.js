/**
 * @fileoverview Controlador da Máquina de Estados da Conversa (FSM Controller).
 * Processa mensagens de entrada, gerencia o estado da sessão em memória e orquestra chamadas aos serviços de negócio.
 */

const STATES = require('./states');
const messages = require('./messages');
const clientService = require('../services/clientService');
const projectService = require('../services/projectService');
const proposalService = require('../services/proposalService');
const { isValidName, isValidEmail, isValidOption, sanitizeText } = require('../utils/validators');
const { cleanPhone } = require('../utils/formatters');

class ConversationFlow {
  constructor() {
    /**
     * Tabela de dispersão em memória para persistência volátil de sessões por número de WhatsApp.
     * Estrutura de chave-valor: phone (string) -> { state: STATES, temp: { serviceId, name, email, description } }
     * @type {Map<string, { state: string, temp: object }>}
     */
    this.sessions = new Map();
  }

  /**
   * Recupera a sessão ativa do contato ou inicializa uma nova no estado 'INITIAL'.
   *
   * @param {string} phone - Telefone sanitizado do remetente.
   * @returns {{ state: string, temp: object }} Objeto de contexto da sessão.
   */
  getSession(phone) {
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, {
        state: STATES.INITIAL,
        temp: {},
      });
    }
    return this.sessions.get(phone);
  }

  /**
   * Realiza o merge (atualização parcial) no estado e nas propriedades temporárias da sessão.
   *
   * @param {string} phone - Telefone identificador.
   * @param {object} partialSession - Propriedades a serem mescladas.
   * @param {string} [partialSession.state] - Novo estado da FSM.
   * @param {object} [partialSession.temp] - Dados temporários de formulário.
   */
  updateSession(phone, partialSession) {
    const current = this.getSession(phone);
    this.sessions.set(phone, {
      ...current,
      ...partialSession,
      temp: {
        ...(current.temp || {}),
        ...(partialSession.temp || {}),
      },
    });
  }

  /**
   * Limpa os dados transitórios da sessão e redefine o ponteiro de estado para 'INITIAL'.
   *
   * @param {string} phone - Telefone do contato.
   */
  resetSession(phone) {
    this.sessions.set(phone, {
      state: STATES.INITIAL,
      temp: {},
    });
  }

  /**
   * Ponto central de processamento de mensagens recebidas.
   * Executa a máquina de estados, trata comandos globais de cancelamento e devolve a resposta calculada.
   *
   * @param {string} senderPhone - ID bruto do remetente (ex: '5511999998888@c.us').
   * @param {string} rawMessage - Corpo textual da mensagem.
   * @returns {Promise<string|null>} Resposta para envio via WhatsApp ou null (ex: atendimento humano).
   */
  async handleMessage(senderPhone, rawMessage) {
    const phone = cleanPhone(senderPhone);
    const text = sanitizeText(rawMessage);
    const session = this.getSession(phone);
    const client = clientService.getByPhone(phone);
    const lower = text.toLowerCase();

    // 1. Tratamento de Comandos Globais de Escape (Interrupção voluntária do fluxo)
    const escapeWords = ['0', 'menu', 'inicio', 'início', 'reiniciar', 'voltar', 'cancelar', 'sair'];
    if (escapeWords.includes(lower) && session.state !== STATES.MAIN_MENU && session.state !== STATES.INITIAL) {
      this.resetSession(phone);
      this.updateSession(phone, { state: STATES.MAIN_MENU });
      return `${messages.sessionReset()}\n${messages.welcome(client ? client.name : '')}`;
    }

    // 2. Guard Clause: Atendimento Humano Ativo
    // Se o contato foi transferido para um humano, o bot suspende mensagens automáticas
    if (session.state === STATES.HUMAN_ATTENDANCE) {
      return null;
    }

    // 3. Máquina de Estados Finita (FSM - Transições determinísticas)
    switch (session.state) {
      // Estado Inicial: Primeiro contato do usuário
      case STATES.INITIAL: {
        this.updateSession(phone, { state: STATES.MAIN_MENU });
        return messages.welcome(client ? client.name : '');
      }

      // Menu Principal: Roteamento para os 4 eixos da aplicação
      case STATES.MAIN_MENU: {
        if (text === '1') {
          // Opção 1: Exibir lista com os 10 serviços do catálogo
          const services = projectService.getAll();
          this.updateSession(phone, { state: STATES.VIEWING_SERVICES_LIST });
          return messages.servicesMenu(services);
        }

        if (text === '2') {
          // Opção 2: Direcionar para a página de Portfólio (laradev.com.br)
          this.updateSession(phone, { state: STATES.PORTFOLIO });
          return messages.portfolio();
        }

        if (text === '3') {
          // Opção 3: Iniciar funil direto de coleta de proposta/orçamento
          const services = projectService.getAll();
          this.updateSession(phone, { state: STATES.SELECTING_SERVICE_FOR_QUOTE });
          return messages.quoteSelectService(services);
        }

        if (text === '4') {
          // Opção 4: Pausar automação e transferir para atendimento pessoal
          this.updateSession(phone, { state: STATES.HUMAN_ATTENDANCE });
          return messages.humanSupport();
        }

        // Fallback: Entrada inválida no menu principal (reapresenta menu sem quebrar estado)
        return `${messages.invalidOption()}\n\n${messages.welcome(client ? client.name : '')}`;
      }

      // Visualização de Portfólio: Opções de avançar para orçamento ou voltar
      case STATES.PORTFOLIO: {
        if (text === '1') {
          const services = projectService.getAll();
          this.updateSession(phone, { state: STATES.SELECTING_SERVICE_FOR_QUOTE });
          return messages.quoteSelectService(services);
        }

        if (text === '0') {
          this.updateSession(phone, { state: STATES.MAIN_MENU });
          return messages.welcome(client ? client.name : '');
        }

        return `${messages.invalidOption()}\n\n${messages.portfolio()}`;
      }

      // Lista Geral de Serviços: Seleciona um serviço de 1 a 10 para ver ficha técnica
      case STATES.VIEWING_SERVICES_LIST: {
        const services = projectService.getAll();
        const option = parseInt(text, 10);

        if (isValidOption(option, 1, services.length)) {
          const serviceDetails = projectService.getFormattedDetails(option);
          this.updateSession(phone, {
            state: STATES.VIEWING_SERVICE_DETAIL,
            temp: { serviceId: String(option) },
          });
          return `${serviceDetails}\n${messages.serviceDetailsFooter()}`;
        }

        if (text === '0') {
          this.updateSession(phone, { state: STATES.MAIN_MENU });
          return messages.welcome(client ? client.name : '');
        }

        return `${messages.invalidOption()}\n\n${messages.servicesMenu(services)}`;
      }

      // Detalhe de um Serviço Específico: Decisão de pedir orçamento direto ou voltar
      case STATES.VIEWING_SERVICE_DETAIL: {
        const services = projectService.getAll();
        const currentServiceId = session.temp.serviceId;

        if (text === '1') {
          // Inicia solicitação de orçamento direto com o serviço já selecionado em 'temp'
          if (client && client.name && client.email) {
            // Se o lead já possui cadastro prévio completo, avança direto para a descrição
            this.updateSession(phone, {
              state: STATES.COLLECTING_DESCRIPTION,
              temp: {
                serviceId: currentServiceId,
                name: client.name,
                email: client.email,
              },
            });
            return `Identifiquei seu cadastro, *${client.name}*!\n\n${messages.askDescription()}`;
          }

          // Lead novo: inicia coleta a partir do nome
          this.updateSession(phone, {
            state: STATES.COLLECTING_NAME,
            temp: { serviceId: currentServiceId },
          });
          return messages.askName();
        }

        if (text === '2') {
          // Retorna para a lista com os 10 serviços
          this.updateSession(phone, { state: STATES.VIEWING_SERVICES_LIST });
          return messages.servicesMenu(services);
        }

        if (text === '0') {
          this.updateSession(phone, { state: STATES.MAIN_MENU });
          return messages.welcome(client ? client.name : '');
        }

        // Opção inválida: reexibe a ficha técnica do serviço atual
        const currentDetails = projectService.getFormattedDetails(currentServiceId) || messages.servicesMenu(services);
        return `${messages.invalidOption()}\n\n${currentDetails}\n${messages.serviceDetailsFooter()}`;
      }

      // Seleção de Serviço para Orçamento: Valida a escolha do projeto
      case STATES.SELECTING_SERVICE_FOR_QUOTE: {
        const services = projectService.getAll();
        const option = parseInt(text, 10);

        if (text === '0') {
          this.updateSession(phone, { state: STATES.MAIN_MENU });
          return messages.welcome(client ? client.name : '');
        }

        if (!isValidOption(option, 1, services.length)) {
          return `${messages.invalidOption()}\n\n${messages.quoteSelectService(services)}`;
        }

        // Se o contato já tiver dados no banco, reutiliza e pula para a descrição
        if (client && client.name && client.email) {
          this.updateSession(phone, {
            state: STATES.COLLECTING_DESCRIPTION,
            temp: {
              serviceId: String(option),
              name: client.name,
              email: client.email,
            },
          });
          return `Identifiquei seu cadastro, *${client.name}*!\n\n${messages.askDescription()}`;
        }

        // Caso contrário, transiciona para a etapa de coleta de nome
        this.updateSession(phone, {
          state: STATES.COLLECTING_NAME,
          temp: { serviceId: String(option) },
        });

        return messages.askName();
      }

      // Coleta de Nome Completo do Lead
      case STATES.COLLECTING_NAME: {
        if (!isValidName(text)) {
          return messages.invalidName();
        }

        this.updateSession(phone, {
          state: STATES.COLLECTING_EMAIL,
          temp: { name: text },
        });

        return messages.askEmail(text);
      }

      // Coleta e Validação de E-mail do Lead
      case STATES.COLLECTING_EMAIL: {
        if (!isValidEmail(text)) {
          return messages.invalidEmail();
        }

        this.updateSession(phone, {
          state: STATES.COLLECTING_DESCRIPTION,
          temp: { email: text.toLowerCase() },
        });

        return messages.askDescription();
      }

      // Coleta da Descrição do Projeto e Montagem da Prévia
      case STATES.COLLECTING_DESCRIPTION: {
        const description = text;
        const currentTemp = session.temp;

        // Atualiza ou insere o lead no repositório de clientes
        clientService.getOrCreate(phone, {
          name: currentTemp.name,
          email: currentTemp.email,
        });

        this.updateSession(phone, {
          state: STATES.CONFIRMING_PROPOSAL,
          temp: { description },
        });

        const chosenService = projectService.getById(currentTemp.serviceId);

        // Cria o payload de prévia para validação do usuário antes de persistir
        const previewProposal = {
          id: 'PRÉVIA',
          clientName: currentTemp.name,
          clientPhone: phone,
          clientEmail: currentTemp.email,
          serviceName: chosenService ? chosenService.name : 'Personalizado',
          priceRange: chosenService ? chosenService.priceRange : '',
          projectDescription: description,
          estimatedPrice: chosenService ? chosenService.basePrice : 0,
          estimatedDeliveryDays: chosenService ? chosenService.deliveryDays : 0,
          createdAt: new Date().toISOString(),
        };

        const summary = proposalService.formatSummary(previewProposal);
        return `${summary}\n${messages.confirmProposalPrompt()}`;
      }

      // Confirmação Final e Persistência da Proposta
      case STATES.CONFIRMING_PROPOSAL: {
        if (text === '1') {
          // Confirmação aceita: persiste no banco e reinicia a sessão
          const proposal = proposalService.createProposal({
            clientPhone: phone,
            clientName: session.temp.name,
            clientEmail: session.temp.email,
            serviceId: session.temp.serviceId,
            projectDescription: session.temp.description,
          });

          this.resetSession(phone);
          return messages.proposalSuccess(proposal.id);
        }

        if (text === '2') {
          // Usuário deseja recomeçar a inserção dos dados do formulário
          this.updateSession(phone, {
            state: STATES.COLLECTING_NAME,
            temp: { serviceId: session.temp.serviceId },
          });
          return messages.askName();
        }

        if (text === '0') {
          this.resetSession(phone);
          this.updateSession(phone, { state: STATES.MAIN_MENU });
          return `${messages.sessionReset()}\n${messages.welcome(client ? client.name : '')}`;
        }

        // Opção inválida: regenera a prévia e repete o prompt
        const currentTemp = session.temp;
        const chosenService = projectService.getById(currentTemp.serviceId);
        const previewProposal = {
          id: 'PRÉVIA',
          clientName: currentTemp.name,
          clientPhone: phone,
          clientEmail: currentTemp.email,
          serviceName: chosenService ? chosenService.name : 'Personalizado',
          priceRange: chosenService ? chosenService.priceRange : '',
          projectDescription: currentTemp.description,
          estimatedPrice: chosenService ? chosenService.basePrice : 0,
          estimatedDeliveryDays: chosenService ? chosenService.deliveryDays : 0,
          createdAt: new Date().toISOString(),
        };

        const summary = proposalService.formatSummary(previewProposal);
        return `${messages.invalidOption()}\n\n${summary}\n${messages.confirmProposalPrompt()}`;
      }

      // Estado Padrão (Fallback Geral de Segurança)
      default: {
        this.resetSession(phone);
        this.updateSession(phone, { state: STATES.MAIN_MENU });
        return messages.welcome(client ? client.name : '');
      }
    }
  }
}

module.exports = new ConversationFlow();
