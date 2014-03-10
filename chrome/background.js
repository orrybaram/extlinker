chrome.extension.onMessage.addListener(function (request, sender) {
    console.log(request)
    chrome.history.addUrl({"url": request.url}, function (data) {
        console.log(data);
    });
});
