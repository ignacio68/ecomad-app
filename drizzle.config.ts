import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/db/bins/schema.ts',
	out: './drizzle/migrations',
	dialect: 'sqlite',
	driver: 'expo',
})
