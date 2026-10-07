/**
 * @fileoverview Repositório de Clientes/Leads (Data Access Object - DAO).
 * Centraliza as operações de leitura, busca, inserção e atualização de contatos.
 */

const db = require('../database/db');

const COLLECTION = 'clients';

class ClientRepository {
  /**
   * Recupera a lista completa de clientes cadastrados na base de dados.
   *
   * @returns {Array<object>} Array de objetos de clientes.
   */
  findAll() {
    return db.readCollection(COLLECTION);
  }

  /**
   * Busca um cliente pelo número de telefone único (chave primária de contato).
   *
   * @param {string} phone - Telefone sanitizado (ex: '5511999998888').
   * @returns {object|null} Objeto do cliente se encontrado; caso contrário `null`.
   */
  findByPhone(phone) {
    const clients = this.findAll();
    return clients.find((c) => c.phone === phone) || null;
  }

  /**
   * Busca um cliente pelo identificador único (ID).
   *
   * @param {string} id - ID do registro gerado na criação.
   * @returns {object|null} Objeto do cliente se encontrado; caso contrário `null`.
   */
  findById(id) {
    const clients = this.findAll();
    return clients.find((c) => c.id === id) || null;
  }

  /**
   * Cria e persiste um novo registro de cliente na coleção.
   * Insere metadados de auditoria (`id`, `createdAt`, `updatedAt`).
   *
   * @param {object} clientData - Payload com os dados do cliente.
   * @param {string} clientData.phone - Telefone do cliente.
   * @param {string} [clientData.name] - Nome completo.
   * @param {string} [clientData.email] - Endereço de e-mail.
   * @returns {object} Registro completo do cliente persistido.
   */
  create(clientData) {
    const clients = this.findAll();
    const newClient = {
      id: String(Date.now()),
      name: clientData.name || '',
      phone: clientData.phone,
      email: clientData.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...clientData,
    };

    clients.push(newClient);
    db.writeCollection(COLLECTION, clients);
    return newClient;
  }

  /**
   * Atualiza os campos de um cliente existente pelo número de telefone e renova `updatedAt`.
   *
   * @param {string} phone - Telefone do cliente a ser atualizado.
   * @param {object} updateData - Propriedades parciais a serem mescladas.
   * @returns {object|null} Objeto do cliente atualizado ou `null` caso não seja localizado.
   */
  updateByPhone(phone, updateData) {
    const clients = this.findAll();
    const index = clients.findIndex((c) => c.phone === phone);

    if (index === -1) return null;

    clients[index] = {
      ...clients[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    db.writeCollection(COLLECTION, clients);
    return clients[index];
  }
}

module.exports = new ClientRepository();
