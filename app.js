const config = require('config')
const ServerController = require('./src/core/server.manager');
String.prototype.replaceAll = function (search, replacement) {
  var target = this
  return target.replace(new RegExp(search, 'g'), replacement)
};

(async () => {

  new ServerController(config)

})();
