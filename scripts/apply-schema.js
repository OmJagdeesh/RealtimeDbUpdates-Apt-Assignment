import { spawn } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const schemaProcess = spawn(
  'psql',
  [process.env.DATABASE_URL, '-f', 'sql/schema.sql'],
  {
    stdio: 'inherit'
  }
);

schemaProcess.on('exit', (code) => {
  process.exit(code ?? 1);
});

schemaProcess.on('error', (error) => {
  console.error(`Failed to run psql: ${error.message}`);
  process.exit(1);
});
