/**
 * @fileoverview Utilitários de validação e sanitização de dados recebidos via WhatsApp.
 * Assegura integridade de tipos e formatos antes de persistência ou transição de estados.
 */

/**
 * Valida se uma string possui formato válido de endereço de e-mail usando expressão regular (RFC 5322 simplificada).
 *
 * @param {string} email - Endereço de e-mail informado pelo usuário.
 * @returns {boolean} `true` se o formato do e-mail for válido; caso contrário `false`.
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida se uma string é um nome com comprimento aceitável para cadastro de lead (entre 2 e 100 caracteres).
 *
 * @param {string} name - Nome informado pelo usuário.
 * @returns {boolean} `true` se atender ao tamanho mínimo e máximo; caso contrário `false`.
 */
function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Valida se uma entrada numérica ou string representa um número inteiro dentro do intervalo fechado [min, max].
 * Utilizado para validação de menus dinâmicos e opções de catálogo.
 *
 * @param {string|number} input - Opção enviada pelo usuário.
 * @param {number} min - Limite inferior aceitável (inclusive).
 * @param {number} max - Limite superior aceitável (inclusive).
 * @returns {boolean} `true` se a opção for válida e estiver dentro do intervalo; caso contrário `false`.
 */
function isValidOption(input, min, max) {
  if (input === undefined || input === null) return false;
  const num = parseInt(String(input).trim(), 10);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Sanitiza o texto recebido de mensagens externas, removendo espaços redundantes nas extremidades.
 *
 * @param {string} text - Mensagem bruta recebida do webhook/handler.
 * @returns {string} String limpa e sem espaços laterais.
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim();
}

module.exports = {
  isValidEmail,
  isValidName,
  isValidOption,
  sanitizeText,
};
