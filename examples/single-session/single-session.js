/* config variable is imported from config.js */

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
    for (const selector of config.settings.selectors) {
        config.selectors[selector.name] = document.querySelector(selector.domSelector)
    }
}

function socketSetup() {
    config.socket = io(config.settings.socket.url);

    config.socket.on("connect", () => {
        console.log(config.socket.id);
    });

    config.socket.on("disconnect", () => {
        console.log(config.socket.id);
    });
}