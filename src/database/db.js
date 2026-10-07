/**
 * @fileoverview Camada de Abstração de Armazenamento em Arquivos JSON.
 * Implementa operações síncronas de leitura e escrita atômica para coleções de dados.
 * Serve como adaptador intermediário, facilitando a substituição futura por um SGBD (ex: SQLite, Postgres).
 */

const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const DATA_DIR = env.database.dataDir;

// Inicialização: Cria o diretório de dados recursivamente caso não exista em tempo de execução
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Monta o caminho absoluto para o arquivo JSON correspondente à coleção informada.
 *
 * @param {string} collectionName - Nome da coleção (ex: 'clients', 'proposals', 'projects').
 * @returns {string} Caminho absoluto do arquivo no sistema de arquivos.
 */
function getFilePath(collectionName) {
  return path.join(DATA_DIR, `${collectionName}.json`);
}

/**
 * Lê e desserializa os dados de uma coleção JSON.
 * Caso o arquivo não exista, cria-o automaticamente com um array vazio `[]`.
 *
 * @param {string} collectionName - Nome da coleção a ser consultada.
 * @returns {Array<object>} Array de registros desserializados ou array vazio em caso de falha/arquivo novo.
 */
function readCollection(collectionName) {
  const filePath = getFilePath(collectionName);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`[DB Error] Falha de I/O ou parse JSON na coleção "${collectionName}":`, error.message);
    return [];
  }
}

/**
 * Serializa e persiste os dados de uma coleção no disco em formato JSON indentado (2 espaços).
 *
 * @param {string} collectionName - Nome da coleção a ser atualizada.
 * @param {Array<object>} data - Conjunto completo de registros para gravação.
 * @returns {boolean} `true` se a gravação for concluída com sucesso; `false` caso ocorra erro de I/O.
 */
function writeCollection(collectionName, data) {
  const filePath = getFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`[DB Error] Falha de gravação de I/O na coleção "${collectionName}":`, error.message);
    return false;
  }
}

module.exports = {
  readCollection,
  writeCollection,
};
