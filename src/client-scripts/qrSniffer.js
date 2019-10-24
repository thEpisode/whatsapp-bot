const target = document.querySelector(qrCodeSelector);
const options = {
  attributes: true,
  attributeOldValue: true,
};
const observer = new MutationObserver((mutations) => {
  mutations.forEach(({ attributeName, oldValue, target }) => {
    switch (attributeName) {
      case 'src':
        console.log('src has been changed!');
        window.qrOnChange({
          success: true,
          result: {
            qr: target.getAttribute('src')
          },
          message: 'QR Code catched'
        })
        break;
      default:
        console.log(attributeName)
        break
    }
  })
});

observer.observe(target, options);

var documentObserver = new MutationObserver(_ => {
  if (document.querySelector(conversationSelector)) {
    console.log('Chat loaded')
    window.chatOnLoaded({
      success: true,
      result: {},
      message: 'Chat window loaded'
    })
  }
});
documentObserver.observe(document.body, { subtree: true, childList: true })