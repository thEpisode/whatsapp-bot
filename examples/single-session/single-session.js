const _example = {
    settings: {
        socket: {
            url: "http://localhost:3500/"
        },
        selectors: [
            { name: 'startSessionBtn', domSelector: '.start-session' },
            { name: 'qrVisorImg', domSelector: '.qr-visor' },
            { name: 'qrDoneImg', domSelector: '.qr-done' },
            { name: 'logsContainer', domSelector: '.logs-container' }
        ]
    },
    socket: {},
    selectors: {}
}


document.addEventListener("DOMContentLoaded", () => {
    setup();
});

function setup() {
    socketSetup();
    selectorsSetup();
}

/**
 * Load in memory all selectors by given name
 */
function selectorsSetup() {
    for (const selector of _example.settings.selectors) {
        _example.selectors[selector.name] = document.querySelector(selector.domSelector)
    }
}

function socketSetup() {
    _example.socket = io(_example.settings.socket.url);

    _example.socket.on("connect", () => {
        console.log(_example.socket.id);
    });

    _example.socket.on("disconnect", () => {
        console.log(_example.socket.id);
    });
}