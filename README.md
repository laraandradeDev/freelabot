# 🤖 FreelaBot - Chatbot para Venda de Soluções Freelancer no WhatsApp

Um chatbot robusto, modular e profissional construído em **Node.js** com **whatsapp-web.js** para automação de atendimento, apresentação de portfólio de serviços freelancer (Landing Pages, Catálogos Digitais, Sistemas de Delivery/Restaurante, Chatbots sob medida) e captura automatizada de leads e solicitações de orçamentos.

---

## 📁 Arquitetura do Projeto

O projeto adota uma arquitetura em camadas baseada em princípios como **Separation of Concerns (SoC)** e **Repository Pattern**:

```
freelabot/
├── src/
│   ├── config/
│   │   └── env.js            # Centralização e tipagem de variáveis de ambiente
│   │
│   ├── whatsapp/
│   │   ├── client.js         # Instanciação do client com LocalAuth e flags do Puppeteer
│   │   └── handlers.js       # Listeners de eventos (QR, ready, message, disconnect)
│   │
│   ├── bot/
│   │   ├── flow.js           # Máquina de Estados (FSM) - controle de fluxo conversacional
│   │   ├── states.js         # Enums/Constantes dos estados possíveis
│   │   └── messages.js       # Templates e redação de todas as mensagens
│   │
│   ├── services/
│   │   ├── clientService.js  # Regras de negócio de clientes/leads
│   │   ├── projectService.js # Regras de catálogo de serviços e cálculos
│   │   └── proposalService.js# Regras de geração e formatação de orçamentos
│   │
│   ├── repositories/
│   │   ├── clientRepository.js   # Acesso e persistência de clientes
│   │   ├── projectRepository.js  # Acesso ao catálogo de projetos
│   │   └── proposalRepository.js # Acesso e persistência de orçamentos
│   │
│   ├── database/
│   │   ├── db.js             # Abstração de leitura/escrita JSON (trocável por SQL/NoSQL)
│   │   └── data/
│   │       ├── clients.json   # Dados persistidos de clientes
│   │       ├── projects.json  # Catálogo inicial de serviços
│   │       └── proposals.json # Propostas geradas pelo bot
│   │
│   ├── utils/
│   │   ├── validators.js     # Validações (e-mail, nome, opções de menu)
│   │   └── formatters.js     # Formatação de moeda (BRL), datas, listas WhatsApp
│   │
│   └── index.js              # Ponto de entrada da aplicação e encerramento gracioso
│
├── .env                      # Variáveis de ambiente locais (ignorado no git)
├── .env.example              # Modelo das variáveis necessárias
├── .gitignore                # Arquivos ignorados pelo Git (sessões, node_modules, etc.)
├── package.json              # Dependências e scripts
└── README.md                 # Documentação
```

---

## 📦 Dependências e Para Que Serve Cada Comando

| Comando | O que faz? |
| :--- | :--- |
| `npm init -y` | Cria o arquivo `package.json` inicial com configurações padrão, definindo o projeto como um pacote Node.js. |
| `npm install whatsapp-web.js` | Biblioteca principal que controla uma instância do WhatsApp Web via Puppeteer/Chromium, permitindo enviar e receber mensagens programaticamente. |
| `npm install dotenv` | Carrega variáveis do arquivo `.env` para o `process.env` do Node.js, protegendo dados sensíveis (chaves, senhas, telefones de admin). |
| `npm install qrcode-terminal` | Gera o QR Code de autenticação do WhatsApp diretamente no terminal para você escanear com a câmera do celular. |
| `npm install -D nodemon` | Dependência de desenvolvimento (`-D`) que monitora alterações nos arquivos de código e reinicia o servidor automaticamente. |

---

## ⚙️ Como Configurar e Rodar

### 1. Clonar ou Acessar a Pasta
```bash
cd freelabot
```

### 2. Configurar o `.env`
O arquivo `.env` já foi criado na raiz com valores padrão. Você pode customizar:
```env
BOT_NAME="DevFreela Bot"
OWNER_NAME="Seu Nome"
OWNER_PHONE="5511999999999"
NODE_ENV="development"
```

### 3. Executar o Projeto em Desenvolvimento
```bash
npm run dev
```

### 4. Escanear o QR Code
1. Abra o WhatsApp no seu smartphone.
2. Acesse **Configurações / Opções** > **Aparelhos conectados** > **Conectar um aparelho**.
3. Aponte a câmera para o QR Code gerado no terminal.
4. Após autenticar, a sessão será salva na pasta `.wwebjs_auth/` (você não precisará escanear toda vez que reiniciar).

---

## 💡 Fluxo da Conversa (Máquina de Estados)

1. **Boas-vindas (`MAIN_MENU`)**:
   - `1` - Conhecer os Serviços (Landing Pages, Catálogos, Sistema de Restaurante, Bots, etc.)
   - `2` - Solicitar Orçamento
   - `3` - Ver Portfólio & Demonstrações
   - `4` - Falar com Atendente Humano
2. **Coleta de Lead & Orçamento (`COLLECTING_*`)**:
   - Escolha do tipo de projeto
   - Coleta de Nome Completo (com validação)
   - Coleta de E-mail (com validação)
   - Descrição das necessidades do projeto
   - Prévia formatada do orçamento com prazo e valor base
   - Confirmação e geração do código `#PROP-XXXXXX`
   - Registro automático nos arquivos JSON em `src/database/data/`

---

## 🚀 Próximos Passos de Evolução

- [ ] **Migração de Banco de Dados:** Substituir `src/database/db.js` por SQLite (com `better-sqlite3` ou `Prisma`) para alta concorrência.
- [ ] **Notificação ao Dono:** Enviar uma mensagem no WhatsApp do dono/admin sempre que uma nova proposta for gerada (`client.sendMessage(env.bot.ownerPhone + '@c.us', ...)`).
- [ ] **Integração com IA (Google Gemini / OpenAI):** Criar um estado intermediário para responder dúvidas livres antes do orçamento.
