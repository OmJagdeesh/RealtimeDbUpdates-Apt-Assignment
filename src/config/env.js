import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const requiredVariables = ['DATABASE_URL'];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const parsePort = (value) => {
  const port = Number(value || 3000);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
};

try {
  const databaseUrl = new URL(process.env.DATABASE_URL);

  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error();
  }
} catch {
  throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL
};
