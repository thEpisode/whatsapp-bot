chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  
  console.log('Changing data from chrome extension: ' + request.data);
  var data = request.data || {};

  writeMessage({ text: request.data });
  sendMessage();

  sendResponse({ data: data, success: true });
  console.log('-------------');
});

function writeMessage(args) {
  if (args && args.text) {
    console.log('Writting message: ' + args.text);
    var input = document.querySelector('#main [contenteditable~=true]');
    if (input) {
      input.innerHTML = args.text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      console.warn('This tab is not a Whatsapp web application')
    }

  }
}

function sendMessage(args) {
  console.log('Sending message');
  var button = document.querySelector('button>span[data-icon="send"]').parentElement;
  if (button) {
    button.click();
  } else {
    console.warn('This tab is not a Whatsapp web application')
  }
}
