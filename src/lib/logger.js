const pino = require('pino');

// Tenta usar pino-pretty para output colorido. Se nao estiver disponivel
// (ex: ambientes minimalistas como Termux sem deps opcionais), cai pro
// modo padrao do pino que escreve JSON em uma linha.
let logger;
try {
  require.resolve('pino-pretty');
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  });
} catch (_) {
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

module.exports = logger;
