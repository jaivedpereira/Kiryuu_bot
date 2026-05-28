# Kiryuu Bot

Bot de WhatsApp em português brasileiro feito com [Baileys](https://github.com/WhiskeySockets/Baileys).
O Kiryuu cria figurinhas (estáticas e animadas), baixa músicas e vídeos do YouTube e tem várias brincadeiras pra animar o grupo. 🤖🇧🇷

---

## ✨ Funcionalidades

### 🛠️ Utilidades
| Comando | Descrição |
|---------|-----------|
| `!menu` | Mostra todos os comandos (aliases: `!help`, `!ajuda`, `!comandos`) |
| `!ping` | Verifica se o bot está online e mede a latência |
| `!info` | Versão, uptime e memória do bot |
| `!detalhe <comando>` | Detalhes de um comando específico |

### 🎨 Figurinhas
| Comando | Descrição |
|---------|-----------|
| `!sticker` | Cria figurinha de imagem ou vídeo (aliases: `!s`, `!fig`, `!figurinha`) |
| `!snome Pacote \| Autor` | Figurinha com pacote/autor personalizados |
| `!toimg` | Converte figurinha estática em imagem PNG |

> Dica: envie ou responda a uma imagem/vídeo (até 10s) com `!sticker` que o Kiryuu transforma na hora.

### 🎬 Downloads
| Comando | Descrição |
|---------|-----------|
| `!musica <nome ou link>` | Baixa música do YouTube (aliases: `!music`, `!mp3`, `!play`) |
| `!video <nome ou link>` | Baixa vídeo do YouTube (aliases: `!mp4`, `!ytvideo`) |
| `!buscar <termo>` | Mostra top 5 resultados do YouTube |
| `!letra Artista - Música` | Busca a letra de uma música |

### 🎮 Brincadeiras
| Comando | Descrição |
|---------|-----------|
| `!casal` | Sorteia um casal aleatório do grupo (ou usa 2 menções) |
| `!sorteio` | Sorteia um membro aleatório do grupo |
| `!ppt pedra\|papel\|tesoura` | Pedra, papel, tesoura |
| `!dado [N]` | Rola um dado de N lados (padrão 6) |
| `!moeda` | Cara ou coroa |
| `!roleta` | Roleta russa (de brincadeira) |
| `!bola8 sua pergunta?` | Bola 8 mágica responde |
| `!escolher op1, op2, op3` | Escolhe uma opção aleatória |
| `!piada` | Conta uma piada do tio |
| `!frase` | Manda uma frase motivacional |
| `!corno`, `!gay`, `!lindo`, `!burro`, `!inteligente` | Medidores (com menção) |

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js 18+** (recomendado 20 ou 22)
- **FFmpeg** disponível no `PATH` (necessário para figurinhas animadas)
  - Linux: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: [ffmpeg.org/download](https://ffmpeg.org/download.html)
- Um número de WhatsApp para o bot (pode ser o seu)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/jaivedpereira/Kiryuu_bot.git
cd Kiryuu_bot

# 2. Instale as dependências
npm install

# 3. (Opcional) Copie o arquivo de configuração
cp .env.example .env
# edite .env se quiser mudar o prefixo, nome ou dono

# 4. Inicie o bot
npm start
```

### Conectando ao WhatsApp

Na primeira execução, o bot vai imprimir um **QR Code** no terminal.
No celular:

1. Abra o WhatsApp
2. Vá em **Configurações > Aparelhos conectados > Conectar um aparelho**
3. Escaneie o QR Code do terminal

A sessão fica salva em `auth/`. Não delete essa pasta para não precisar escanear de novo.

---

## ⚙️ Configuração

Variáveis em `.env` (todas opcionais):

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BOT_NAME` | `Kiryuu` | Nome do bot mostrado no menu |
| `BOT_PREFIX` | `!` | Prefixo dos comandos |
| `BOT_OWNER` | _(vazio)_ | Número do dono no formato `5511999999999` |

---

## 📁 Estrutura do projeto

```
Kiryuu_bot/
├── src/
│   ├── index.js                  # Entry point + conexão Baileys
│   ├── config.js                 # Configurações globais
│   ├── handlers/
│   │   ├── messageHandler.js     # Roteia mensagens para comandos
│   │   └── commandLoader.js      # Carrega comandos dinamicamente
│   ├── lib/                      # Utilitários (logger, sticker, ytdl, etc.)
│   └── commands/
│       ├── utils/                # menu, ping, info, detalhe
│       ├── figurinhas/           # sticker, toimg, snome
│       ├── downloads/            # musica, video, buscar, letra
│       └── brincadeiras/         # casal, dado, ppt, etc.
├── auth/                         # Sessão do WhatsApp (gerada no 1º login)
├── tmp/                          # Arquivos temporários
├── .env.example
└── package.json
```

---

## ➕ Como adicionar um novo comando

Crie um arquivo em `src/commands/<categoria>/<nome>.js`:

```js
module.exports = {
  name: 'oi',
  aliases: ['ola'],
  category: 'utilidades',
  description: 'Cumprimenta o usuario',
  async run(ctx) {
    await ctx.reply(`Oi, @${ctx.sender.split('@')[0]}!`);
  },
};
```

O loader detecta automaticamente. Reinicie o bot e pronto.

### O objeto `ctx`

| Propriedade | Descrição |
|-------------|-----------|
| `ctx.sock` | Socket do Baileys |
| `ctx.msg` | Mensagem original |
| `ctx.args` | Array de argumentos |
| `ctx.text` | Texto após o comando |
| `ctx.jid` | JID do chat (grupo ou DM) |
| `ctx.sender` | JID de quem mandou |
| `ctx.isGroup` | Booleano |
| `ctx.mentioned` | Lista de JIDs mencionados |
| `ctx.quoted` | Mensagem citada |
| `ctx.reply(texto ou objeto)` | Responde citando a mensagem |
| `ctx.react(emoji)` | Reage à mensagem |

---

## ⚠️ Aviso

Este bot usa **WhatsApp Web não oficial** via Baileys. O uso intenso pode resultar em banimento da conta.
Use por sua conta e risco — recomendado em **número descartável** ou de teste.

## 📝 Licença

MIT
