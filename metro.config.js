const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Agregar soporte para archivos .sql (necesario para migraciones de Drizzle)
config.resolver.sourceExts.push('sql')

module.exports = withNativeWind(config, { input: './src/app/global.css' })
