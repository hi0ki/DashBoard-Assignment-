// Prisma v7 configuration for SQLite
export const config = {
  datasources: {
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
}