import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

if (process.env.NODE_ENV === "production" && !tursoUrl) {
  throw new Error("TURSO_DATABASE_URL wajib diisi di environment production.")
}

if (tursoUrl && !tursoToken) {
  throw new Error("TURSO_AUTH_TOKEN wajib diisi jika TURSO_DATABASE_URL digunakan.")
}

const prismaClient = tursoUrl
  ? new PrismaClient({
      adapter: new PrismaLibSQL(
        createClient({
          url: tursoUrl,
          authToken: tursoToken,
        })
      ),
    })
  : new PrismaClient()

export const prisma = globalForPrisma.prisma || prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma