// Content
$(function() {

    var $previewer = $('<div id="ext-link-viewer"></div>');
    $('body').append($previewer);

    $('p').find('a').each(function() {
        var $this = $(this);
        var url = $(this).attr('href');
        if(isExternal(url)) {
            console.log($(this))

            if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
                $this.css({'backgroundColor': 'yellow'});

                hoverDelay($this, function() {
                    var image = new Image();
                    image.src = url;
                    $previewer.html(image);
                    $previewer.css({ 'top': $this.offset().top, 'left': $this.offset().left + $this.width() + 25 })
                    $previewer.fadeIn();
                }, function() {
                    $previewer.fadeOut();
                })
            } else {
                hoverDelay($this, function() {
                    $.get(url).success(function(data) {
                        console.log(data)
                    })
                });
            }
        }
    });
});

function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}

function hoverDelay($el, fn, fn2, delay) {
    var delay_time = 500;
    if (delay) delay_time = delay;
    $el.hover(function() {
        window.hoverTimeout = setTimeout(function() {
            fn();
        }, delay_time)
    }, function() {
        clearTimeout(window.hoverTimeout)
        fn2();
    })
}
