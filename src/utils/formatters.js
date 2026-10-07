/**
 * @fileoverview Utilitários de transformação e formatação de dados para apresentação no WhatsApp.
 * Converte moedas, datas, identificadores de usuário (JID) e estruturas de lista em texto formatado.
 */

/**
 * Formata um valor numérico para representação em Real Brasileiro (BRL) segundo as normas da ISO 4217.
 *
 * @param {number|string} value - Valor monetário numérico a ser formatado.
 * @returns {string} String formatada (ex: 'R$ 1.500,00').
 */
function formatCurrency(value) {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata uma instância de Date ou timestamp ISO 8601 para o padrão brasileiro (DD/MM/AAAA, HH:mm).
 * Aplica explicitamente o fuso horário 'America/Sao_Paulo'.
 *
 * @param {Date|string} [date] - Objeto Date ou string ISO. Se omitido, utiliza o timestamp atual.
 * @returns {string} Data e hora formatadas (ex: '07/10/2026, 18:30').
 */
function formatDate(date) {
  const targetDate = date ? new Date(date) : new Date();
  return targetDate.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Extrai o número de telefone limpo (DDI + DDD + Número) a partir de um JID do WhatsApp.
 * Remove sufixos como '@c.us' (contato individual) e '@s.whatsapp.net'.
 *
 * @param {string} jid - Identificador bruto do remetente (ex: '5511999998888@c.us').
 * @returns {string} Número de telefone higienizado (ex: '5511999998888').
 */
function cleanPhone(jid) {
  if (!jid || typeof jid !== 'string') return '';
  return jid.replace('@c.us', '').replace('@s.whatsapp.net', '');
}

/**
 * Converte um array de strings em uma lista visual com marcadores (bullet points) para o chat do WhatsApp.
 *
 * @param {Array<string>} items - Lista de itens/funcionalidades.
 * @returns {string} String multilinhas com recuo e marcadores (ex: '  ▪ Item 1\n  ▪ Item 2').
 */
function formatBulletList(items) {
  if (!Array.isArray(items)) return '';
  return items.map((item) => `  ▪ ${item}`).join('\n');
}

module.exports = {
  formatCurrency,
  formatDate,
  cleanPhone,
  formatBulletList,
};
