/* config variable is imported from config.js */
document.addEventListener("DOMContentLoaded", () => {
  setup();
});

function setup () {
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

function actionsSetup () {
  global.selectors.sendMessageBtn.onclick = async () => {
    axios.post(window.config.settings.backend.url + window.config.settings.backend.endpoint,  window.config.payload)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}
