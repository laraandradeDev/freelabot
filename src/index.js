/**
 * @fileoverview Ponto de Entrada da Aplicação (Bootstrap / Entry Point).
 * Inicializa os módulos de configuração, anexa os listeners de eventos do WhatsApp,
 * executa o cliente e gerencia o encerramento gracioso (Graceful Shutdown) dos processos do SO.
 */

const env = require('./config/env');
const client = require('./whatsapp/client');
const { registerHandlers } = require('./whatsapp/handlers');

console.log('──────────────────────────────────────────────────────────');
console.log(`🚀 Inicializando ${env.bot.name}...`);
console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
console.log('──────────────────────────────────────────────────────────');

// 1. Registra os manipuladores de eventos do WhatsApp (QR Code, mensagens recebidas, reconexão)
registerHandlers(client);

// 2. Inicializa o cliente do WhatsApp (lança o navegador Chromium via Puppeteer)
client.initialize().catch((err) => {
  console.error('❌ Falha crítica ao inicializar o WhatsApp Client:', err);
  process.exit(1);
});

/**
 * Procedimento de encerramento gracioso (Graceful Shutdown).
 * Garante que a instância do Chromium e o driver do Puppeteer sejam destruídos corretamente,
 * prevenindo processos zumbis na memória e travas residuais de arquivo (SingletonLock).
 *
 * @param {string} signal - Nome do sinal POSIX recebido (ex: 'SIGINT', 'SIGTERM').
 */
const shutdown = async (signal) => {
  console.log(`\n🛑 Sinal [${signal}] recebido. Encerrando sessão com segurança...`);
  try {
    await client.destroy();
    console.log('👋 Cliente WhatsApp finalizado.');
  } catch (error) {
    console.error('Erro ao encerrar cliente:', error.message);
  } finally {
    process.exit(0);
  }
};

// Tratamento de sinais de interrupção (Ctrl+C no terminal) e terminação de processo
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Tratamento global para rejeições de Promises assíncronas não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Unhandled Rejection]:', reason);
});

// Tratamento global para exceções síncronas não capturadas
process.on('uncaughtException', (err) => {
  console.error('💥 [Uncaught Exception]:', err);
});
