// Listen for new messages from extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let data = typeof request.data === 'object' ? request.data : JSON.parse(request.data || {})

  switch (data.action) {
    case 'send-message':
      writeMessage(data);
      sendMessage();
      break;
    case 'start-listening':
      startListening();
    default:
      break;
  }

  sendResponse({ data: data, success: true });
});

function writeMessage(args) {
  if (args) {
    var input = document.querySelector('#main [contenteditable~=true]');
    if (input) {
      input.innerHTML = args.message;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      console.warn('This tab is not a Whatsapp web application')
    }
  }
}

function sendMessage(args) {
  var button = document.querySelector('button>span[data-icon="send"]').parentElement;
  if (button) {
    button.click();
  } else {
    console.warn('This tab is not a Whatsapp web application')
  }
}

let startListening = () => {
  startListeningInactiveWhatsapp();
  startListeningNewMessagesOtherConversations();
  startListeningNewMessagesActiveConversation();
}

let startListeningInactiveWhatsapp = () => {

}

let startListeningNewMessagesActiveConversation = () => {
  /// TODO: Test mutations and catch when a message is newest
  var target = document.querySelector('#main');

  // create an observer instance
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {

      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length > 0) {
          let messageMutation = mutation.addedNodes.item(0)
          
          if (messageMutation && messageMutation.nodeType === 1) {
            let newMessageIncomingContainer = messageMutation.querySelector('.message-in')
            let newMessageOutcomingContainer = messageMutation.querySelector('.message-out')
            let newMesageElement = undefined
            let newMessage = ''
            if (newMessageIncomingContainer) {
              newMesageElement = newMessageIncomingContainer.querySelector('.selectable-text')
              newMessage = newMesageElement.innerText || newMesageElement.textContent
              console.log('Message incoming: ', newMessage)
            } else if (newMessageOutcomingContainer) {
              newMesageElement = newMessageOutcomingContainer.querySelector('.selectable-text')
              newMessage = newMesageElement.innerText || newMesageElement.textContent
              console.log('Message outcoming: ', newMessage)
            }
          }

        }
      }
    });
  });

  // configuration of the observer:
  var config = {
    childList: true,
    subtree: true,
    characterData: true
  };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);
}

let startListeningNewMessagesOtherConversations = () => {

}
