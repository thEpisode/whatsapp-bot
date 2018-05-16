chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(typeof request.data)
  let data = typeof request.data === 'object' ? request.data : JSON.parse(request.data || {})

  console.log('Message received: ' + request.data.action);

  switch (data.action) {
    case 'send':
      writeMessage({ text: data.message });
      sendMessage();
      break;
    case 'start':
      startListening();
    default:
      break;
  }

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


let startListening = () => {
  var target = document.querySelector('#main');

  // create an observer instance
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      console.log('Mutation type: ', mutation.type);
    });
  });

  // configuration of the observer:
  var config = {
    attributes: true, 
    childList: true,
    subtree: true,
    characterData: true
  };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);
}
