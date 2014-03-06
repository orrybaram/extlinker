// Content
$(function() {

    var $previewer = $('<div id="ext-link-viewer"></div>');
    $('body').append($previewer);

    $('p').find('a').each(function() {
        var $this = $(this);
        var url = $(this).attr('href');
        if(isExternal(url)) {
            console.log($(this))

            if ($this[0].host === 'en.wikipedia.org') {
                // fetchRemoteData($this, url, function(data) {
                //     console.log(data)
                // })
            }
            else if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
                $this.css({'border-bottom': '1px dotted'});
                $this.hover(function() {
                    var image = new Image();
                    image.src = url;
                    var imgHeight = image.height;
                    var imgWidth = image.width;
                    $previewer.html(image);

                })

            } else {
                 console.log('nope')
            }

        }
    });
});

function fetchRemoteData(context, url, callback) {
    context.hover(function() {
        $.get(url).success(function(data) { callback(data) })
    })

}


function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}
