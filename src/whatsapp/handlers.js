/**
 * @fileoverview Manipulador de Eventos do Cliente WhatsApp.
 * Conecta os eventos emitidos pela biblioteca whatsapp-web.js (QR code, autenticação, mensagens) ao fluxo da aplicação.
 */

const qrcode = require('qrcode-terminal');
const flow = require('../bot/flow');
const env = require('../config/env');

/**
 * Registra os event listeners no cliente WhatsApp.
 *
 * @param {import('whatsapp-web.js').Client} client - Instância ativa do cliente WhatsApp Web.
 */
function registerHandlers(client) {
  // Evento: 'qr' -> Disparado quando uma nova chave de pareamento QR Code precisa ser escaneada
  client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log('📱 ESCANEIE O QR CODE ABAIXO COM O SEU WHATSAPP:');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
    console.log('\nAbra o WhatsApp no celular > Aparelhos conectados > Conectar um aparelho.\n');
  });

  // Evento: 'authenticated' -> Disparado quando a sessão é validada com sucesso
  client.on('authenticated', () => {
    console.log('✅ [WhatsApp] Autenticação realizada com sucesso!');
  });

  // Evento: 'auth_failure' -> Disparado quando a chave de sessão expira ou é revogada
  client.on('auth_failure', (msg) => {
    console.error('❌ [WhatsApp] Falha crítica de autenticação:', msg);
  });

  // Evento: 'ready' -> Disparado quando a sincronização de mensagens/contatos termina e o bot está operacional
  client.on('ready', () => {
    console.log('\n======================================================');
    console.log(`🤖 [${env.bot.name}] BOT PRONTO E ONLINE!`);
    console.log('======================================================\n');
  });

  // Evento: 'message' -> Disparado ao receber qualquer mensagem de entrada
  client.on('message', async (msg) => {
    try {
      // 1. Filtro: Ignora atualizações de status / stories do WhatsApp
      if (msg.from === 'status@broadcast') return;

      // 2. Filtro: Ignora mensagens enviadas em grupos (foco estrito em mensagens privadas 1 a 1)
      if (msg.from.endsWith('@g.us')) return;

      // 3. Filtro: Ignora mensagens enviadas pelo próprio bot (evita loops recursivos de eco)
      if (msg.fromMe) return;

      // 4. Filtro: Ignora mensagens sem payload textual (ex: figurinhas soltas, áudios puros)
      const text = msg.body;
      if (!text || typeof text !== 'string') return;

      console.log(`📩 [Mensagem Recebida] de ${msg.from}: "${text}"`);

      // 5. Encaminha o texto para o motor de fluxo e obtém a resposta da máquina de estados
      const response = await flow.handleMessage(msg.from, text);

      // 6. Se houver resposta calculada, envia de volta ao usuário via WhatsApp
      if (response) {
        await client.sendMessage(msg.from, response);
        console.log(`📤 [Resposta Enviada] para ${msg.from}`);
      }
    } catch (error) {
      console.error('❌ [WhatsApp Handler] Falha ao processar mensagem:', error);
      try {
        // Fallback defensivo para informar o usuário sem travar a sessão
        await client.sendMessage(
          msg.from,
          '⚠️ Ocorreu um erro temporário ao processar sua mensagem. Digite *0* para reiniciar o menu.'
        );
      } catch (sendError) {
        console.error('❌ [WhatsApp Handler] Falha ao enviar mensagem de fallback:', sendError);
      }
    }
  });

  // Evento: 'disconnected' -> Disparado quando a conexão com o WhatsApp Web é encerrada
  client.on('disconnected', (reason) => {
    console.warn('⚠️ [WhatsApp] Cliente desconectado. Motivo:', reason);
  });
}

module.exports = {
  registerHandlers,
};
