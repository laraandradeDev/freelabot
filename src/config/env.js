/**
 * @fileoverview Centralizador de configurações e variáveis de ambiente da aplicação.
 * Carrega o arquivo .env e expõe um objeto imutável com fallbacks seguros.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carrega as variáveis do arquivo .env localizado na raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Resolve dinamicamente o caminho absoluto do executável do Google Chrome ou Chromium.
 * Prioriza a variável de ambiente CHROME_PATH; caso ausente, itera por caminhos padrão do SO (Linux, Windows, macOS).
 *
 * @returns {string|undefined} Caminho absoluto do executável ou undefined caso use o cache padrão do Puppeteer.
 */
function resolveChromePath() {
  // 1. Verifica se o caminho foi explicitamente informado no .env
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  // 2. Lista de diretórios padrões conhecidos nos sistemas operacionais
  const commonPaths = [
    // Linux (Debian, Ubuntu, Arch, Fedora)
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  return commonPaths.find((binaryPath) => fs.existsSync(binaryPath));
}

/**
 * Objeto de configuração da aplicação com tipagem e valores padrão (fallbacks).
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  bot: {
    name: process.env.BOT_NAME || 'LaraDev Bot',
    ownerName: process.env.OWNER_NAME || 'Lara Dev',
    ownerPhone: process.env.OWNER_PHONE || '',
    website: process.env.WEBSITE_URL || 'https://laradev.com.br',
  },
  whatsapp: {
    sessionPath: process.env.SESSION_DATA_PATH || './.wwebjs_auth',
    clientId: process.env.CLIENT_ID || 'freelabot-session',
    chromePath: resolveChromePath(),
  },
  database: {
    dataDir: path.resolve(process.cwd(), 'src/database/data'),
  },
};

module.exports = env;
