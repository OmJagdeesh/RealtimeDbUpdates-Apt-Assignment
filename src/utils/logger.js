const formatLog = (level, message, context = {}) => {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  };

  return JSON.stringify(entry);
};

export const logger = {
  info(message, context) {
    console.log(formatLog('info', message, context));
  },

  warn(message, context) {
    console.warn(formatLog('warn', message, context));
  },

  error(message, context) {
    console.error(formatLog('error', message, context));
  }
};
