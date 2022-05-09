/* config variable is imported from config.js */
document.addEventListener("DOMContentLoaded", () => {
  setup();
});

function setup () {
  socketSetup();
  selectorsSetup();
  actionsSetup();
}

/**
 * Load in memory all selectors by given name
 */
function selectorsSetup () {
  for (const selector of config.settings.selectors) {
    global.selectors[selector.name] = document.querySelector(selector.domSelector)
  }
}

function socketSetup () {
  global.socket = io(config.settings.socket.url);

  global.socket.on("connect", () => {
    logWebsocket("SocketId: " + global.socket.id);
    emitEvent('register-connection#request', {});
  });

  global.socket.on("disconnect", () => {
    logWebsocket("SocketId: " + global.socket.id);
  });

  global.socket.on("reversebytes.beat.server", onServerEvent)
}

function onServerEvent (payload) {
  logWebsocket('Receiving event: ' + payload.command, payload)

  if (!payload || !payload.command || !payload.context) {
    return
  }

  if (payload.context.receiver.socketId !== global.socket.id) {
    return
  }

  switch (payload.command) {
    case "start-session#response":

      break;
    case "register-connection#response":
      logWebsocket('Socket registered')
      break;
    default:
      logWebsocket('Unhandled event: ' + payload.command, payload)
      break;
  }
}

function actionsSetup () {
  global.selectors.startSessionBtn.onclick = () => {
    if (global.isSessionStarted) {
      alert('Session is started')
      return
    }

    global.isSessionStarted = true
    emitEvent('start-session#request', { user: config.user })
  }
}

function emitEvent (command, data) {
  const payload = {
    context: {
      channel: config.settings.socket.contextChannel,
      type: config.settings.socket.contextType,
      sender: { socketId: global.socket.id },
      nativeId: config.settings.machineId
    },
    command: command,
    values: data
  }

  global.socket.emit(config.settings.socket.eventContext, payload)

  logWebsocket('Emiting event: ' + command, payload)
}

function logWebsocket (title, body) {
  if (!body) {
    console.log(`#WS> ${title}`)
    return
  }

  console.log(`#WS> ${title}`, body)
}