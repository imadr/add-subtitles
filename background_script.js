browser.browserAction.onClicked.addListener((tab) => {
    browser.tabs.executeScript({
        file: "/content_scripts/jszip.min.js"
    }, function(){
        browser.tabs.executeScript({
            file: "/content_scripts/add_subtitles.js"
        });
    });
});