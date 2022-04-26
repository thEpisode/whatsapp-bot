/**
 * Main start
 *
 * To read documentation go to https://github.com/thepisode/beat/wiki
 */

const { ServerManager } = require('./src/core/server.manager')

const main = async () => {
  const server = new ServerManager({ root: __dirname })
  const dependencies = await server.loadServer()

  server.start(dependencies)
}

main()
