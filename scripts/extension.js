var whTab = null;
document.addEventListener('DOMContentLoaded', function () {


});

window.onload = function () {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(tab => {
      var url = tab.url;

      if (url.includes('web.whatsapp.com')) {
        whTab = tab
      }
    });
  })

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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { data: { action: 'start', message: '' } }, function (response) {
        $('#status').html('App started');
      });
    });
  })
}

let sendMessage = () => {
  $('#status').html('Clicked change links button');
  var text = $('#content-input').val();
  if (!text) {
    $('#status').html('Invalid text provided');
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { data: { action: 'send', message: text } }, function (response) {
      $('#status').html('changed data in page');
    });
  });
}

let denyUsage = () => {
  $('#status').html('Current website seems to be not Whatsapp web');
  $('.allowed-container').hide();
  $('.allowed-actions').hide();
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
