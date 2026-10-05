	mport { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const g = globalThis as any;
export const db = g.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') g.prisma = db;
