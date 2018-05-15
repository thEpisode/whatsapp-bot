document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('status').textContent = "Extension loaded";
    var button = document.getElementById('changelinks');
    button.addEventListener('click', function () {
        $('#status').html('Clicked change links button');
        var text = $('#linkstext').val();
        if (!text) {
            $('#status').html('Invalid text provided');
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: text}, function(response) {
                $('#status').html('changed data in page');
                console.log('success');
            });
        });
    });
});

