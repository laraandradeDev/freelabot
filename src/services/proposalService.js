/**
 * @fileoverview Camada de Regras de Negócio de Propostas e Orçamentos (Service Layer).
 * Processa a montagem de orçamentos, cálculo de prazos/valores e formatação de resumos para o lead.
 */

const proposalRepository = require('../repositories/proposalRepository');
const projectRepository = require('../repositories/projectRepository');
const { formatCurrency, formatDate } = require('../utils/formatters');

class ProposalService {
  /**
   * Consolida as informações coletadas durante a conversa, calcula os parâmetros do projeto e persiste a proposta.
   *
   * @param {object} params - Parâmetros da proposta.
   * @param {string} params.clientPhone - Telefone do cliente.
   * @param {string} params.clientName - Nome completo informado.
   * @param {string} params.clientEmail - E-mail do cliente.
   * @param {string} params.serviceId - ID do serviço selecionado.
   * @param {string} params.projectDescription - Escopo/detalhes informados pelo cliente.
   * @returns {object} Registro completo da proposta gerada e salva no banco.
   */
  createProposal({ clientPhone, clientName, clientEmail, serviceId, projectDescription }) {
    const service = projectRepository.findById(serviceId);

    const proposalData = {
      clientPhone,
      clientName,
      clientEmail,
      serviceId,
      serviceName: service ? service.name : 'Projeto Personalizado',
      priceRange: service ? service.priceRange : '',
      estimatedPrice: service ? service.basePrice : 0,
      estimatedDeliveryDays: service ? service.deliveryDays : 0,
      projectDescription: projectDescription || 'Não especificado',
    };

    return proposalRepository.create(proposalData);
  }

  /**
   * Gera a mensagem de resumo da proposta comercial com formatação visual de linhas e emojis para o WhatsApp.
   *
   * @param {object} proposal - Objeto da proposta (prévia ou já persistida).
   * @returns {string} Texto formatado com todos os dados da proposta para conferência do cliente.
   */
  formatSummary(proposal) {
    const priceDisplay = proposal.priceRange || formatCurrency(proposal.estimatedPrice);

    return (
      `📄 *RESUMO DA SUA SOLICITAÇÃO* (#${proposal.id})\n` +
      `──────────────────────────\n` +
      `👤 *Nome:* ${proposal.clientName}\n` +
      `📱 *WhatsApp:* ${proposal.clientPhone}\n` +
      `📧 *E-mail:* ${proposal.clientEmail}\n` +
      `🛠️ *Serviço Escolhido:* ${proposal.serviceName}\n` +
      `💡 *Detalhes do Projeto:* ${proposal.projectDescription}\n` +
      `💰 *Faixa de Investimento Estimada:* ${priceDisplay}\n` +
      `⏱️ *Prazo Médio de Entrega:* ~${proposal.estimatedDeliveryDays} dias úteis\n` +
      `📅 *Data:* ${formatDate(proposal.createdAt)}\n` +
      `──────────────────────────`
    );
  }
}

module.exports = new ProposalService();
