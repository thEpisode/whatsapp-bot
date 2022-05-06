/**
 * Main start
 *
 * To read documentation go to https://github.com/thepisode/beat/wiki
 */

 const { ServerManager } = require('./src/core/server.manager')
 const server = new ServerManager({ root: __dirname })
 
 const main = async () => {
   const dependencies = await server.loadServer()
 
   // Launching server
   dependencies.console.info(`http://localhost:${dependencies.config.SERVER_PORT}/`, 'Server')
   dependencies.console.info(`${dependencies.config.SERVER_NAME} v${dependencies.config.SERVER_VERSION}`, 'Server')
   dependencies.console.log(' ------------------------------------')
 }
 
 main()
 