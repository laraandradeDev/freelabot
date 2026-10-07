/**
 * @fileoverview Camada de Regras de Negócio de Clientes (Service Layer).
 * Orquestra operações de domínio de clientes, controle de sessão cadastral e garantia de idempotência.
 */

const clientRepository = require('../repositories/clientRepository');

class ClientService {
  /**
   * Obtém um cliente pelo número de telefone ou cria um novo registro de forma idempotente.
   *
   * @param {string} phone - Telefone do cliente.
   * @param {object} [initialData={}] - Dados complementares iniciais (ex: name, email).
   * @returns {object} Registro completo do cliente existente ou recém-criado.
   */
  getOrCreate(phone, initialData = {}) {
    let client = clientRepository.findByPhone(phone);
    if (!client) {
      client = clientRepository.create({
        phone,
        ...initialData,
      });
    }
    return client;
  }

  /**
   * Atualiza os dados cadastrais do cliente (ex: preenchimento de nome ou e-mail durante o fluxo).
   *
   * @param {string} phone - Telefone identificador do cliente.
   * @param {object} data - Dados a serem atualizados no cadastro.
   * @returns {object|null} Cliente com dados atualizados ou `null` caso não exista.
   */
  update(phone, data) {
    return clientRepository.updateByPhone(phone, data);
  }

  /**
   * Consulta os dados de um cliente pelo telefone para fins de saudação ou pré-preenchimento.
   *
   * @param {string} phone - Telefone do cliente.
   * @returns {object|null} Objeto do cliente ou `null` caso seja o primeiro contato.
   */
  getByPhone(phone) {
    return clientRepository.findByPhone(phone);
  }
}

module.exports = new ClientService();
