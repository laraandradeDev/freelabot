/**
 * @fileoverview Configuração e inicialização da instância do cliente WhatsApp (whatsapp-web.js).
 * Configura autenticação persistente (LocalAuth), flags de otimização do Chromium para Linux e limpeza de locks órfãos.
 */

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const env = require('../config/env');

/**
 * Remove travas órfãs do Chromium ('SingletonLock', 'SingletonSocket', 'SingletonCookie').
 * Evita o erro 'The browser is already running' caso o processo anterior tenha sido finalizado abruptamente.
 */
function cleanSessionLocks() {
  try {
    const sessionDir = path.resolve(
      process.cwd(),
      env.whatsapp.sessionPath,
      `session-${env.whatsapp.clientId}`
    );

    if (fs.existsSync(sessionDir)) {
      const lockFiles = ['SingletonLock', 'SingletonSocket', 'SingletonCookie'];
      for (const file of lockFiles) {
        const filePath = path.join(sessionDir, file);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            // Ignora silenciosamente se o arquivo estiver bloqueado por processo ativo
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ [WhatsApp Client] Falha ao verificar travas de sessão:', error.message);
  }
}

// Limpeza preventiva executada antes de instanciar o Puppeteer
cleanSessionLocks();

/**
 * Argumentos de inicialização do processo Chromium via Puppeteer.
 * Flags otimizadas para ambientes headless e servidores Linux (evita crash de memória compartilhada /dev/shm).
 */
const puppeteerOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
  ],
};

// Se o binário do Chrome foi identificado no sistema, injeta o caminho explicitamente
if (env.whatsapp.chromePath) {
  puppeteerOptions.executablePath = env.whatsapp.chromePath;
}

/**
 * Instância exportada do cliente WhatsApp com estratégia de autenticação local.
 */
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: env.whatsapp.clientId,
    dataPath: env.whatsapp.sessionPath,
  }),
  puppeteer: puppeteerOptions,
});

module.exports = client;
