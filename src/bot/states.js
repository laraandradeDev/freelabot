/**
 * @fileoverview Definição dos Estados da Máquina de Estados Finita (Finite State Machine - FSM).
 * Enumera todas as etapas do ciclo de vida da conversa entre o cliente e o bot.
 */

/**
 * @readonly
 * @enum {string}
 */
const STATES = {
  /** Estado inicial ao receber a primeira mensagem de um contato */
  INITIAL: 'INITIAL',

  /** Menu principal de navegação com as 4 opções primárias */
  MAIN_MENU: 'MAIN_MENU',

  /** Listagem geral dos 10 serviços e faixas de investimento */
  VIEWING_SERVICES_LIST: 'VIEWING_SERVICES_LIST',

  /** Visualização dos detalhes técnicos e comerciais de um serviço selecionado */
  VIEWING_SERVICE_DETAIL: 'VIEWING_SERVICE_DETAIL',

  /** Apresentação do link do portfólio oficial (laradev.com.br) */
  PORTFOLIO: 'PORTFOLIO',

  /** Etapa de seleção de serviço específico para o fluxo de orçamento */
  SELECTING_SERVICE_FOR_QUOTE: 'SELECTING_SERVICE_FOR_QUOTE',

  /** Coleta e validação do nome completo do lead */
  COLLECTING_NAME: 'COLLECTING_NAME',

  /** Coleta e validação do e-mail do lead */
  COLLECTING_EMAIL: 'COLLECTING_EMAIL',

  /** Coleta da descrição/escopo das necessidades do projeto */
  COLLECTING_DESCRIPTION: 'COLLECTING_DESCRIPTION',

  /** Apresentação da prévia e confirmação final dos dados da proposta */
  CONFIRMING_PROPOSAL: 'CONFIRMING_PROPOSAL',

  /** Estado de transferência para atendimento humano (silencia respostas automáticas) */
  HUMAN_ATTENDANCE: 'HUMAN_ATTENDANCE',
};

module.exports = STATES;
