import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'
import { env } from '@/config/env'

const databaseUrl = env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Please set it in your .env file.')
}

const queryClient = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle({ client: queryClient, schema })
