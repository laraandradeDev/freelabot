/**
 * @fileoverview Camada de Regras de Negócio do Catálogo de Projetos (Service Layer).
 * Encapsula a lógica de consulta e formatação dos detalhes técnicos e comerciais dos serviços prestados.
 */

const projectRepository = require('../repositories/projectRepository');
const { formatCurrency, formatBulletList } = require('../utils/formatters');

class ProjectService {
  /**
   * Obtém a listagem completa dos serviços oferecidos.
   *
   * @returns {Array<object>} Lista com os 10 serviços e suas propriedades.
   */
  getAll() {
    return projectRepository.findAll();
  }

  /**
   * Recupera os dados de um serviço por seu ID.
   *
   * @param {string|number} id - ID numérico ou string do serviço.
   * @returns {object|null} Objeto com dados do serviço ou `null`.
   */
  getById(id) {
    return projectRepository.findById(id);
  }

  /**
   * Constrói o texto detalhado de apresentação de um serviço formatado com Markdown do WhatsApp.
   * Inclui descrição, público-alvo, funcionalidades inclusas, faixa de investimento e prazo estimado.
   *
   * @param {string|number} id - ID do serviço.
   * @returns {string|null} Mensagem formatada para o chat ou `null` caso o ID seja inválido.
   */
  getFormattedDetails(id) {
    const project = this.getById(id);
    if (!project) return null;

    const priceText = project.priceRange || formatCurrency(project.basePrice);

    return (
      `📌 *${project.name}*\n\n` +
      `📝 *Descrição:* ${project.description}\n\n` +
      `🎯 *Ideal para:* ${project.idealFor}\n\n` +
      `✨ *O que está incluso:*\n${formatBulletList(project.features)}\n\n` +
      `💰 *Investimento estimado:* ${priceText}\n` +
      `⏱️ *Prazo médio de entrega:* ~${project.deliveryDays} dias úteis`
    );
  }
}

module.exports = new ProjectService();
