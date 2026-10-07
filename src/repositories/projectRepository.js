/**
 * @fileoverview Repositório de Serviços e Projetos Freelancer (Catálogo).
 * Fornece métodos de consulta somente leitura para o catálogo de soluções oferecidas.
 */

const db = require('../database/db');

const COLLECTION = 'projects';

class ProjectRepository {
  /**
   * Retorna a lista de todos os serviços de desenvolvimento cadastrados no catálogo.
   *
   * @returns {Array<object>} Lista com os modelos de serviços (id, name, slug, priceRange, etc.).
   */
  findAll() {
    return db.readCollection(COLLECTION);
  }

  /**
   * Localiza um serviço específico no catálogo através do seu ID identificador.
   *
   * @param {string|number} id - ID numérico ou string do serviço (ex: 1, '1').
   * @returns {object|null} Objeto do serviço se localizado; caso contrário `null`.
   */
  findById(id) {
    const projects = this.findAll();
    return projects.find((p) => String(p.id) === String(id)) || null;
  }

  /**
   * Localiza um serviço através de seu slug amigável (identificador textual único).
   *
   * @param {string} slug - Slug do serviço (ex: 'landing-page', 'catalogo-digital-whatsapp').
   * @returns {object|null} Objeto do serviço se localizado; caso contrário `null`.
   */
  findBySlug(slug) {
    const projects = this.findAll();
    return projects.find((p) => p.slug === slug) || null;
  }
}

module.exports = new ProjectRepository();
