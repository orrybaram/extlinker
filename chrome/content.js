// Content
$(function() {

    var $previewer = $('<div id="ext-link-viewer"></div>');
    $('body').append($previewer);

    $('p').find('a').each(function() {
        var $this = $(this);
        var url = $(this).attr('href');
        if(isExternal(url)) {
            console.log($(this))

            $this.css({'backgroundColor': 'yellow'});
            hoverDelay($this, function() {
                if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
                    var image = new Image();
                    image.src = url;
                    $previewer.html(image);
                } else {
                    $previewer.css({ 'width': '800', 'height': '500' })
                    $previewer.html('<iframe src="'+ url +'"></iframe>');
                }
                $previewer.css({ 'top': $this.offset().top, 'left': $this.offset().left + $this.width() + 25 })
                $previewer.fadeIn();
            }, function() {
                setTimeout(function() {
                    checkIfHovered($previewer, function() {
                        $previewer.fadeOut();
                    })
                }, 100)
            });
        }
    });
});

function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}

function hoverDelay($el, fn1, fn2) {
    var delay_time = 500;

    $el.hover(function() {
        window.hoverTimeout = setTimeout(function() {
            if (fn1) fn1();
        }, delay_time)
    }, function() {
        clearTimeout(window.hoverTimeout)
        if (fn2) fn2();
    })
}

function checkIfHovered($el, callback) {
    console.log('check')
    if ($el.is(":hover")) {
        setTimeout(function() { checkIfHovered($el, callback) }, 100)
    } else {
        callback();
    }
}
