/* config variable is imported from config.js */
document.addEventListener("DOMContentLoaded", () => {
  setup();
});

function setup () {
  selectorsSetup();
  actionsSetup();
  socketSetup();
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
  setStatus('connecting')
  global.socket = io(config.settings.socket.url,{
    reconnectionAttempts: 10
  });

  global.socket.on("connect", () => {
    logWebsocket("SocketId: " + global.socket.id);
    emitEvent('register-connection#request', {});
    setStatus('online')
  });

  global.socket.on("reconnect", () => {
    logWebsocket("SocketId: " + global.socket.id);
    setStatus('online')
  });

  global.socket.on("reconnect_attempt", () => {
    logWebsocket("SocketId: " + global.socket.id);
    setStatus('connecting')
  });

  global.socket.on("reconnect_failed", () => {
    logWebsocket("reconnect_failed: " + global.socket.id);
    setStatus('offline')
  });

  global.socket.on("disconnect", () => {
    logWebsocket("SocketId: " + global.socket.id);
    setStatus('offline')
  });

  global.socket.on("reversebytes.beat.server", onServerEvent)
}

function onServerEvent (payload) {
  if (!payload || !payload.command || !payload.context) {
    return
  }

  if (payload.context.receiver.socketId !== global.socket.id) {
    return
  }

  logWebsocket('Receiving event: ' + payload.command, payload)

  switch (payload.command) {
    case "register-connection#response":
      logWebsocket('Socket registered')
      break;
    case "create-agent#response":
      logWebsocket('Agent created')
      break;
    case "create-client#response":
      logWebsocket('Client created')
      break;
    case "wh-client-qr#event":
      global.selectors.qrVisorImg.style.display = 'block'
      logWebsocket('Client QR generated')
      setupQR(payload.values)
      break;
    case "wh-client-ready#event":
      global.selectors.qrVisorImg.style.display = 'none'
      global.selectors.qrDoneImg.style.display = 'block'
      logWebsocket('Client ready')
      break;
    case "conversation-message#event":
      logWebsocket('Conversation message')
      break
    default:
      logWebsocket('Unhandled event: ' + payload.command, payload)
      break;
  }
}

function actionsSetup () {
  global.selectors.createAgentBtn.onclick = () => {
    if (global.isCreatedAgent) {
      alert('Session is started')
      return
    }

    global.isCreatedAgent = true
    emitEvent('create-agent#request', { user: config.user })
  }

  global.selectors.createClientBtn.onclick = () => {
    if (global.isCreatedClient) {
      alert('Client is created')
      return
    }

    global.isCreatedClient = true
    emitEvent('create-client#request', { user: config.user })
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
  let logElements = ''

  global.logs.push({ title, body })

  if (!body) {
    console.log(`#WS> ${title}`)
  } else {
    console.log(`#WS> ${title}`, body)
  }

  for (let i = 0; i < global.logs.length; i++) {
    const log = global.logs[i];
    logElements += `
    <article class="mx-3 mt-3 border-bottom font-monospace">
      <button class="btn text-start" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${i}"
        aria-expanded="false" aria-controls="collapse-${i}">${log.title}</button>
      <div class="collapse" id="collapse-${i}">
        <div class="card card-body">
          <pre><code class="language-javascript">${JSON.stringify(log.body, null, '\t')}</code></pre>
        </div>
      </div>
    </article>
    `
  }

  global.selectors.logsContainer.innerHTML = logElements

  // Format the code snippet into JS readable content
  hljs.highlightAll()
}

function setupQR (payload) {
  QRCode.toCanvas(global.selectors.qrVisorImg, payload.qr, (error) => {
    if (error) console.error(error)
    console.log('QR Printed');
  })
}

function setStatus (status) {
  const state = config.settings.status[status]

  global.selectors.statusDot.classList.remove('online')
  global.selectors.statusDot.classList.remove('offline')
  global.selectors.statusDot.classList.remove('connecting')
  global.selectors.statusDot.classList.add(state.cssClass)
  global.selectors.statusText.innerHTML = state.title
}