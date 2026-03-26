import { existsSync, copyFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import process from 'node:process'

const ROOT = process.cwd()

async function setup() {
  console.log('🚀 Project setup initializing...\n')

  // Step 1: .env check
  const envPath = `${ROOT}/.env`
  const envExamplePath = `${ROOT}/.env.example`

  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      console.error('❌ .env.example not found. Please create it first.')
      process.exit(1)
    }
    copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env from .env.example')
    console.log('⚠️  Please edit .env and fill in the required environment variables\n')
  } else {
    console.log('✅ .env file already exists, skipping copy\n')
  }

  // Step 2 & 3: Database migration
  const envContent = readFileSync(envPath, 'utf-8')
  const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m)
  const dbUrlValue = dbUrlMatch ? dbUrlMatch[1].trim() : ''
  const hasDatabaseUrl =
    dbUrlValue.length > 0 &&
    !dbUrlValue.startsWith('#') &&
    dbUrlValue !== 'your-database-url-here'

  if (!hasDatabaseUrl) {
    console.warn('⚠️  DATABASE_URL is not configured, skipping database migration')
    console.warn('   Once configured, you can run manually: bun run migrate:local\n')
  } else {
    try {
      console.log('📦 Running database migrations...')
      execSync('bun run migrate:local', { stdio: 'inherit', cwd: ROOT })
      console.log('✅ Database migrations completed\n')
    } catch {
      console.error('❌ Database migration failed. Please check your DATABASE_URL configuration.')
      process.exit(1)
    }
  }

  // Step 4: Summary
  console.log('🎉 Setup complete!')
  console.log('   Next step: bun dev')
}

setup().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
