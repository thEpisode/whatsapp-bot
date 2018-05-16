var whTab = null;

window.onload = function () {
  // Search in all tabs if exist any instance of Whatsapp Web
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(tab => {
      var url = tab.url;

      if (url.includes('web.whatsapp.com')) {
        whTab = tab
      }
    });
  })

  // Check if active tab is Whatsapp web or not
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    var url = tabs[0].url;

    if (url.includes('web.whatsapp.com')) {
      startApp()
    } else {
      denyUsage()
    }
  });
}

let startApp = () => {
  document.getElementById('status').textContent = "Whatsapp chatbot loaded";
  $('.jump-actions').hide();
  $('.allowed-actions').show;
  
  registerEvents();
}

let registerEvents = ()=>{
  let sendMessageButton = document.getElementById('send-message-button');
  let startAppButton = document.getElementById('start-app-button');

  sendMessageButton.addEventListener('click', function (e) {
    e.preventDefault()
    sendMessage();
  });

  startAppButton.addEventListener('click', function (e) {
    e.preventDefault();

    // Send a message to start listening on mutations
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { data: { action: 'start-listening', message: '' } }, function (response) {
        $('#status').html('App started');
      });
    });
  })
}

let sendMessage = () => {
  $('#status').html('Sending message...');
  var text = $('#content-input').val();

  if (!text) {
    $('#status').html('Invalid text provided');
    return;
  }

  // Send a message to frontend
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { data: { action: 'send-message', message: text } }, function (response) {
      $('#status').html('changed data in page');
    });
  });
}

let denyUsage = () => {
  $('#status').html('Current website seems to be not Whatsapp web');
  $('.allowed-container').hide();
  $('.allowed-actions').hide();
  
  // If exist any Whatsapp tab instance jump to..
  if (whTab) {
    var button = document.getElementById('jump-to-whatsapp');
    button.addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.update(whTab.id, { highlighted: true });
    })
    $('.jump-actions').show();
  } else {
    $('.jump-actions').hide();
  }
}
