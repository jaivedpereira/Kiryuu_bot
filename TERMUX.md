# 📱 Instalando o Kiryuu no Termux (Android)

Tutorial passo a passo, do zero, pra rodar o Kiryuu Bot direto no seu celular Android usando o Termux. Sem PC, sem servidor, sem complicação.

---

## ⚠️ Antes de começar — leia isto!

1. **Não baixe Termux pela Play Store!** A versão de lá está desatualizada e quebrada.
   Baixe pelo **F-Droid**: https://f-droid.org/packages/com.termux/
   (ou pelo GitHub: https://github.com/termux/termux-app/releases)

2. **Use um número descartável** — bots não-oficiais correm risco de banimento do WhatsApp. Não use seu número principal.

3. **Bateria e Wi-Fi**: o bot só funciona com o Termux aberto. Quando você fecha ele, o bot cai. Existe um truque para mantê-lo rodando em segundo plano que vou mostrar no final.

---

## 1️⃣ Instalando o Termux

1. Baixe e instale o **Termux** pelo [F-Droid](https://f-droid.org/packages/com.termux/)
2. Abra o Termux
3. Aceite as permissões pedidas

> 💡 **Dica:** aperte o volume do celular pra cima quando o teclado aparecer no Termux pra ter acesso a teclas especiais (Tab, Esc, setas).

---

## 2️⃣ Atualizando o Termux

Cole esse comando no Termux (segura no terminal e cola, ou digita):

```bash
pkg update -y && pkg upgrade -y
```

Vai pedir confirmação algumas vezes — pode dar `Enter` ou apertar `y`.

---

## 3️⃣ Instalando as ferramentas necessárias

Cola esse comando inteiro de uma vez:

```bash
pkg install -y nodejs git ffmpeg python
```

Isso instala:
- **nodejs** — pra rodar o bot
- **git** — pra baixar o código
- **ffmpeg** — pra criar figurinhas animadas
- **python** — necessário pra compilar algumas dependências do Node

Confere se instalou tudo:
```bash
node -v
git --version
ffmpeg -version
```

Todos devem mostrar uma versão. Se der erro, repita o `pkg install`.

---

## 4️⃣ Dando permissão de armazenamento (opcional, mas útil)

```bash
termux-setup-storage
```

Vai abrir uma janelinha pedindo permissão — aceita. Isso permite o bot acessar suas fotos/vídeos se quiser usar pasta compartilhada.

---

## 5️⃣ Baixando o Kiryuu

```bash
cd ~
git clone https://github.com/jaivedpereira/Kiryuu_bot.git
cd Kiryuu_bot
```

> ⚠️ **Se o PR ainda não foi mergeado**, use a branch:
> ```bash
> git clone -b feat/kiryuu-bot-inicial https://github.com/jaivedpereira/Kiryuu_bot.git
> cd Kiryuu_bot
> ```

---

## 6️⃣ Instalando as dependências

```bash
npm install
```

⏱️ **Isso demora bastante no celular (5 a 15 minutos)** — o Node precisa compilar várias coisas. **Não feche o Termux**, deixa rolando.

Se der `npm warn deprecated` ou avisos amarelos, **ignora** — é normal.
Se der erro vermelho **`ERESOLVE`** ou **`peer dep`**, tente:
```bash
npm install --legacy-peer-deps
```

---

## 7️⃣ Iniciando o bot

```bash
npm start
```

O Termux vai mostrar um **QR Code grandão** feito de quadradinhos. Tipo isso:

```
█▀▀▀▀▀█ ▀▀▄▀█ █▀▀▀▀▀█
█ ███ █ ▀ ▀█▀ █ ███ █
█ ▀▀▀ █ ▄▀▀█▄ █ ▀▀▀ █
...
```

---

## 8️⃣ Conectando o número do WhatsApp

**No celular onde está o número do bot** (pode ser outro celular, ou o mesmo se você tiver dois WhatsApps):

1. Abre o **WhatsApp**
2. Vai em **Configurações** (engrenagem ⚙️)
3. Toca em **Aparelhos conectados**
4. Toca em **Conectar um aparelho**
5. **Escaneia o QR Code** que apareceu no Termux

> 💡 Se for usar o mesmo celular, dá pra tirar print do QR ou abrir o Termux em uma tela e o WhatsApp em outra (modo dividido/multitarefa).

Quando conectar, vai aparecer no Termux:
```
[INFO] Kiryuu conectado com sucesso!
```

🎉 **Pronto! O bot tá funcionando!**

---

## 9️⃣ Testando

Manda uma mensagem do **outro WhatsApp** pro número do bot (ou adiciona ele em um grupo) e digita:

```
!menu
```

Se ele responder com a lista de comandos, deu certo!

Testa também:
- `!ping` — pra ver latência
- `!piada` — pra dar risada
- `!sticker` — responde uma foto com esse comando
- `!musica engenheiros do hawaii` — baixa música do YouTube

---

## 🔋 Mantendo o bot rodando 24/7 no celular

Por padrão, o Android mata o Termux pra economizar bateria. Pra evitar isso:

### Passo 1: Ative o wake lock

No Termux digita:
```bash
termux-wake-lock
```

Isso impede o celular de "dormir" enquanto o bot está rodando.

### Passo 2: Tira o Termux da otimização de bateria

1. Vai em **Configurações do Android > Bateria > Otimização de bateria**
2. Acha o **Termux** na lista
3. Marca como **"Não otimizar"** ou **"Sem restrição"**

### Passo 3 (opcional): Use `screen` ou `tmux`

Se você quiser fechar o Termux mas deixar o bot rodando em background:

```bash
pkg install -y tmux
tmux new -s kiryuu
npm start
```

Pra "soltar" sem matar: aperte `Ctrl + B` e depois `D`.
Pra voltar: `tmux attach -t kiryuu`.

---

## 🐛 Erros comuns e como resolver

### Erro: `unable to determine transport target for "pino-pretty"`
Esse era um bug da v1, **já corrigido**. Atualize o código:
```bash
cd ~/Kiryuu_bot
git pull
npm install
```

### Erro: `ffmpeg: not found`
```bash
pkg install -y ffmpeg
```

### Erro: `EACCES` ou `permission denied`
```bash
chmod -R u+w ~/Kiryuu_bot
```

### Erro: `npm install` demora demais ou trava
- Fecha tudo e roda só `npm install` de novo
- Se travar, tenta: `npm install --no-optional --legacy-peer-deps`

### Erro: `Connection Closed` ou `Sessao deslogada`
- Apague a pasta de sessão e escaneie o QR de novo:
  ```bash
  rm -rf auth
  npm start
  ```

### Erro: `Cannot find module 'sharp'` ou `node-gyp` falhando
A versão atual já não usa `sharp` (substituído por ffmpeg). Atualize:
```bash
git pull
rm -rf node_modules
npm install
```

### O QR Code aparece "esmagado" no terminal
Aumente o terminal: aperte os botões de volume + um dedo na tela pra abrir o menu do Termux e diminua o tamanho da fonte (`Style`).

---

## 📋 Resumo dos comandos (cola e roda)

```bash
# 1. Atualiza
pkg update -y && pkg upgrade -y

# 2. Instala dependencias
pkg install -y nodejs git ffmpeg python

# 3. Permissoes
termux-setup-storage

# 4. Clona
cd ~
git clone https://github.com/jaivedpereira/Kiryuu_bot.git
cd Kiryuu_bot

# 5. Instala
npm install

# 6. Roda (escaneia QR no WhatsApp)
termux-wake-lock
npm start
```

---

## 💬 Comandos do bot

Depois que conectar, mande no WhatsApp:

| Categoria | Comandos |
|-----------|----------|
| **Geral** | `!menu`, `!ping`, `!info` |
| **Figurinhas** | `!sticker` (responde foto/video), `!toimg`, `!snome Pacote \| Autor` |
| **Downloads** | `!musica nome`, `!video nome`, `!buscar termo`, `!letra Artista - Musica` |
| **Brincadeiras** | `!casal`, `!sorteio`, `!ppt pedra`, `!dado`, `!moeda`, `!roleta`, `!bola8 pergunta?`, `!piada`, `!frase` |
| **Medidores** | `!corno @user`, `!gay @user`, `!burro @user`, `!lindo @user`, `!inteligente @user` |

---

Boa diversão com o Kiryuu! 🤖🇧🇷
