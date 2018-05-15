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
  var button = document.getElementById('changelinks');
  document.getElementById('status').textContent = "Extension loaded";
  $('.jump-actions').hide();
  $('.allowed-actions').show;
  button.addEventListener('click', function (e) {
    e.preventDefault()
    $('#status').html('Clicked change links button');
    var text = $('#content-input').val();
    if (!text) {
      $('#status').html('Invalid text provided');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { data: text }, function (response) {
        $('#status').html('changed data in page');
        console.log('success');
      });
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
