/**
 * @fileoverview Dicionário e gerador de templates de mensagens para o WhatsApp.
 * Isola a camada de apresentação textual e copywriting da lógica de orquestração do bot.
 */

const env = require('../config/env');

const messages = {
  /**
   * Gera a mensagem de boas-vindas com o Menu Principal de 4 opções.
   *
   * @param {string} [userName=''] - Nome do cliente caso já exista no banco de dados.
   * @returns {string} Mensagem de boas-vindas formatada.
   */
  welcome: (userName = '') => {
    const greeting = userName ? `Olá, *${userName}*!` : 'Olá! Seja muito bem-vindo(a)!';
    return (
      `👋 ${greeting}\n\n` +
      `Eu sou a assistente virtual da *${env.bot.ownerName}*. ` +
      `Desenvolvo sistemas, sites e automações sob medida para impulsionar o seu negócio no digital.\n\n` +
      `Como posso te ajudar hoje?\n\n` +
      `1️⃣  *Meus Serviços & Valores*\n` +
      `2️⃣  *Ver Meu Portfólio*\n` +
      `3️⃣  *Solicitar um Orçamento*\n` +
      `4️⃣  *Falar Diretamente Comigo*\n\n` +
      `👉 *Responda digitando o número da opção desejada:*`
    );
  },

  /**
   * Gera a lista de serviços para visualização de detalhes (Opção 1 do Menu).
   *
   * @param {Array<object>} [services=[]] - Lista de serviços recuperados do repositório.
   * @returns {string} Menu de serviços numerado.
   */
  servicesMenu: (services = []) => {
    let text = `🚀 *MEUS SERVIÇOS & SOLUÇÕES DIGITAIS*\n\n`;
    text += `Selecione um dos serviços abaixo para ver detalhes, o que está incluso e prazos médios:\n\n`;

    services.forEach((s) => {
      const price = s.priceRange || `R$ ${s.basePrice}`;
      text += `*${s.id}* - ${s.name} _(${price})_\n`;
    });

    text += `\n*0* - ↩️ Voltar ao Menu Principal\n\n`;
    text += `👉 *Digite o número do serviço que deseja conhecer em detalhes:*`;
    return text;
  },

  /**
   * Gera o menu de seleção de serviço exclusivo para o início do fluxo de orçamento (Opção 3).
   *
   * @param {Array<object>} [services=[]] - Lista de serviços disponíveis.
   * @returns {string} Menu de seleção para proposta.
   */
  quoteSelectService: (services = []) => {
    let text = `💼 *SOLICITAR ORÇAMENTO*\n\n`;
    text += `Para qual tipo de projeto você deseja receber uma proposta?\n\n`;

    services.forEach((s) => {
      text += `*${s.id}* - ${s.name}\n`;
    });

    text += `\n*0* - ↩️ Cancelar e voltar ao Menu Principal\n\n`;
    text += `👉 *Digite o número do serviço desejado:*`;
    return text;
  },

  /**
   * Rodapé de ações anexado após a exibição dos detalhes de um serviço específico.
   *
   * @returns {string} Opções de ação (1 - Pedir orçamento, 2 - Outros serviços, 0 - Início).
   */
  serviceDetailsFooter: () => {
    return (
      `\n──────────────────────────\n` +
      `1️⃣  *Quero solicitar um orçamento para este serviço*\n` +
      `2️⃣  *Ver outros serviços*\n` +
      `0️⃣  *Voltar ao Menu Principal*\n\n` +
      `👉 *Digite a opção desejada:*`
    );
  },

  /**
   * Mensagem informativa de Portfólio com direcionamento para o site oficial (Opção 2).
   *
   * @returns {string} Mensagem com o link do portfólio.
   */
  portfolio: () => {
    const website = env.bot.website || 'https://laradev.com.br';
    return (
      `💼 *MEU PORTFÓLIO & PROJETOS*\n\n` +
      `Você pode conferir meus principais projetos, telas e demonstrações acessando meu site oficial:\n\n` +
      `🌐 *${website}*\n\n` +
      `Lá você encontrará exemplos reais de Landing Pages, Catálogos, Sistemas de Gestão e Bots em funcionamento!\n\n` +
      `Gostaria de criar um projeto personalizado para você?\n\n` +
      `1️⃣  *Sim, quero solicitar um orçamento*\n` +
      `0️⃣  *Voltar ao Menu Principal*\n\n` +
      `👉 *Digite a opção desejada:*`
    );
  },

  /**
   * Mensagem de transição para atendimento humano (Opção 4).
   *
   * @returns {string} Mensagem informando encaminhamento para atendimento direto.
   */
  humanSupport: () => {
    return (
      `👩‍💻 *ATENDIMENTO PESSOAL*\n\n` +
      `Recebi sua solicitação de contato! Já fui notificada e responderei sua mensagem pessoalmente em breve por aqui.\n\n` +
      `Se desejar, pode ir adiantando sua dúvida ou a ideia do seu projeto!\n\n` +
      `*(Digite *0* a qualquer momento se desejar reativar o menu automático)*`
    );
  },

  /**
   * Pergunta solicitando o nome completo do usuário.
   *
   * @returns {string} Texto da pergunta.
   */
  askName: () =>
    `👤 Para começarmos o seu orçamento, por favor, me informe o seu *Nome Completo*:\n\n` +
    `*(Digite *0* a qualquer momento para voltar ao menu)*`,

  /**
   * Pergunta solicitando o e-mail do usuário.
   *
   * @param {string} name - Nome informado na etapa anterior.
   * @returns {string} Texto da pergunta personalizada com o nome.
   */
  askEmail: (name) =>
    `Prazer, *${name}*! 📧 Agora me informe o seu melhor *E-mail* para envio da proposta:\n\n` +
    `*(Digite *0* a qualquer momento para voltar ao menu)*`,

  /**
   * Pergunta solicitando os detalhes/escopo do projeto.
   *
   * @returns {string} Texto da pergunta.
   */
  askDescription: () =>
    `📝 Descreva resumidamente o que você precisa no seu projeto (ex: objetivo principal, funcionalidades desejadas, se já possui identidade visual/logo etc.):\n\n` +
    `*(Digite *0* a qualquer momento para voltar ao menu)*`,

  /**
   * Prompt de confirmação dos dados preenchidos antes de salvar a proposta.
   *
   * @returns {string} Opções de confirmação (1 - Sim, 2 - Recomeçar, 0 - Cancelar).
   */
  confirmProposalPrompt: () =>
    `\nOs dados acima estão corretos para envio da solicitação?\n\n` +
    `1️⃣  *Sim, confirmar e enviar solicitação*\n` +
    `2️⃣  *Não, desejo recomeçar o preenchimento*\n` +
    `0️⃣  *Cancelar e voltar ao Menu Principal*\n\n` +
    `👉 *Digite a opção desejada:*`,

  /**
   * Mensagem de sucesso enviada após a persistência da proposta no banco.
   *
   * @param {string} proposalId - Protocolo da proposta gerada (ex: 'PROP-270264').
   * @returns {string} Mensagem de agradecimento com o protocolo de atendimento.
   */
  proposalSuccess: (proposalId) =>
    `🎉 *SOLICITAÇÃO RECEBIDA COM SUCESSO!*\n\n` +
    `Sua solicitação foi registrada sob o código *#${proposalId}*.\n\n` +
    `Vou analisar os detalhes do seu projeto e entrarei em contato com você por aqui o mais breve possível com a proposta formal detalhada.\n\n` +
    `Muito obrigada pelo interesse e confiança! 🚀\n\n` +
    `Digite *menu* ou *0* para voltar ao início quando quiser.`,

  /**
   * Mensagem de alerta para opção numérica inexistente em um menu.
   *
   * @returns {string} Mensagem de erro.
   */
  invalidOption: () => `⚠️ *Opção inválida.*`,

  /**
   * Mensagem de alerta para formato de e-mail inválido.
   *
   * @returns {string} Mensagem de erro com exemplo.
   */
  invalidEmail: () =>
    `⚠️ *E-mail inválido.* Por favor, digite um e-mail válido (exemplo: seuemail@dominio.com):\n\n*(Ou digite *0* para voltar ao menu)*`,

  /**
   * Mensagem de alerta para nome muito curto.
   *
   * @returns {string} Mensagem de erro.
   */
  invalidName: () =>
    `⚠️ Por favor, digite um nome válido com pelo menos 2 caracteres:\n\n*(Ou digite *0* para voltar ao menu)*`,

  /**
   * Notificação de reinício de conversa ao acionar palavras-chave de escape ('0', 'menu').
   *
   * @returns {string} Texto indicando reinício.
   */
  sessionReset: () => `🔄 *Menu reiniciado.*\n`,
};

module.exports = messages;
