/**
 * @fileoverview Repositório de Propostas e Orçamentos (DAO).
 * Gerencia a persistência, consulta por cliente e controle de status de solicitações de projeto.
 */

const db = require('../database/db');

const COLLECTION = 'proposals';

class ProposalRepository {
  /**
   * Retorna a lista completa de todas as propostas salvas no sistema.
   *
   * @returns {Array<object>} Lista com todas as propostas e seus status.
   */
  findAll() {
    return db.readCollection(COLLECTION);
  }

  /**
   * Busca uma proposta específica através de seu identificador de protocolo (ex: 'PROP-270264').
   *
   * @param {string} id - Código de protocolo da proposta.
   * @returns {object|null} Objeto da proposta caso encontrada; caso contrário `null`.
   */
  findById(id) {
    const proposals = this.findAll();
    return proposals.find((p) => p.id === id) || null;
  }

  /**
   * Filtra e retorna todas as propostas vinculadas a um determinado número de telefone.
   *
   * @param {string} phone - Telefone do cliente (ex: '5511999998888').
   * @returns {Array<object>} Array contendo o histórico de propostas daquele número.
   */
  findByPhone(phone) {
    const proposals = this.findAll();
    return proposals.filter((p) => p.clientPhone === phone);
  }

  /**
   * Cria uma nova solicitação de proposta no banco de dados com protocolo único e status inicial 'PENDING'.
   *
   * @param {object} proposalData - Dados da solicitação coletados pelo bot.
   * @param {string} proposalData.clientPhone - Telefone do solicitante.
   * @param {string} proposalData.clientName - Nome do cliente.
   * @param {string} proposalData.clientEmail - E-mail do cliente.
   * @param {string} proposalData.serviceId - ID do serviço escolhido.
   * @param {string} proposalData.serviceName - Nome do serviço.
   * @param {string} [proposalData.priceRange] - Faixa de preço estimada.
   * @param {number} [proposalData.estimatedPrice] - Preço base numérico.
   * @param {number} [proposalData.estimatedDeliveryDays] - Prazo estimado em dias úteis.
   * @param {string} proposalData.projectDescription - Descrição das necessidades do cliente.
   * @returns {object} Registro da proposta persistido.
   */
  create(proposalData) {
    const proposals = this.findAll();
    const newProposal = {
      id: `PROP-${Date.now().toString().slice(-6)}`,
      status: 'PENDING', // Ciclo de vida: PENDING -> CONTACTED -> ACCEPTED -> REJECTED
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...proposalData,
    };

    proposals.push(newProposal);
    db.writeCollection(COLLECTION, proposals);
    return newProposal;
  }

  /**
   * Altera o status operacional de uma proposta existente (ex: marcar como 'CONTACTED' ou 'ACCEPTED').
   *
   * @param {string} id - Código de protocolo da proposta.
   * @param {string} status - Novo status desejado.
   * @returns {object|null} Proposta atualizada ou `null` caso o ID não exista.
   */
  updateStatus(id, status) {
    const proposals = this.findAll();
    const index = proposals.findIndex((p) => p.id === id);

    if (index === -1) return null;

    proposals[index].status = status;
    proposals[index].updatedAt = new Date().toISOString();

    db.writeCollection(COLLECTION, proposals);
    return proposals[index];
  }
}

module.exports = new ProposalRepository();
