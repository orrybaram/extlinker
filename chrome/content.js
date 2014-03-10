// Content

var hover_delay_interval = 1000;

$(function() {

    // Check to see that we're not on an secured site, otherwise this thing wont work
    if (window.location.protocol !== "https:") {
        var $previewer_container = $('<div id="link-previewer-container"></div>');
        var $previewer = $('<div id="link-previewer"></div>');

        $previewer_container.append($previewer);
        $('body').append($previewer_container);

        function scanLinks() {
            $('p').find('a').each(function() {
                var $this = $(this);

                if (!$this.hasClass('scanned-by-link-previewer')) {
                    $this.addClass('scanned-by-link-previewer');

                    var url = $(this).attr('href');
                    var blacklisted = false;

                    if (url.indexOf('.zip') > 0 || url.indexOf('mailto') > 0) {
                        blacklisted = true;
                    }
                    if(isExternal(url) && !blacklisted) {
                        $this.css({
                          'backgroundColor': shadeRGBColor($this.css('color'), .97),
                          'border-bottom': '1px solid '+ shadeRGBColor($this.css('color'), .7),
                          'text-decoration': 'none',
                          'display': 'inline-block'
                        })

                        hoverDelay($this, function() {

                            chrome.extension.sendMessage({"url": url});

                            // URL IS AN IMAGE
                            if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
                                var image = new Image();
                                image.src = url;
                                $previewer.html(image);
                                $(image).load(function() {
                                    $previewer.css({ 'height': image.height, 'width': image.width })
                                })
                            }
                            else if ($this[0].host === 'vimeo.com') {
                                var video_id = $this[0].pathname.replace('/', '');
                                $previewer.html('<iframe src="//player.vimeo.com/video/' + video_id + '?color=c9ff23" width="1068" height="600" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                                $previewer.css({ 'width': '1068', 'height': '600' })
                            }
                            else if ($this[0].host === 'www.youtube.com') {
                                var video_id = getParmFromHash(url, 'v')
                                console.log(video_id)
                                $previewer.html('<iframe src="//www.youtube.com/embed/'+ video_id +'"></iframe>');
                                $previewer.css({ 'width': '1067', 'height': '600' })
                            }

                            // URL IS AN EXTERNAL LINK
                            else {
                                var $iframe = $('<iframe src="'+ url +'"></iframe>')
                                var $loading = $('<p class="loading">Loading...</p>')

                                $previewer
                                    .css({ 'width': window.innerWidth - 300, 'height': window.innerHeight - 100 })
                                    .html('')
                                    .append($loading)
                                    .append($iframe);

                                $iframe.hide().load(function() {
                                   $loading.hide();
                                   $iframe.fadeIn();
                                })

                                // Test URL for errors
                                $.get(url).success(function(data, status, request) {
                                    var headers = request.getAllResponseHeaders();

                                    if (/sameorigin/i.test(headers) || /deny/i.test(headers)) {
                                        $previewer.html('<p class="previewer_error">Failed to load this site</p><p class="previewer_link">Go directly to <a target="_blank" class="scanned-by-link-previewer" href="' + url + '">'+ url +'</a>');
                                    }
                                });
                            }
                            setTimeout(function() {
                                if ($previewer.height() < window.innerHeight) {
                                    $previewer.css({ 'top': '50%', 'margin-top': -$previewer.height() / 2, 'margin-left': -$previewer.width() / 2 })
                                } else {
                                    $previewer.css({'top':'50px', 'margin-top': '0', 'margin-left': -$previewer.width() / 2 })
                                }
                            },100)

                            $previewer_container.fadeIn();

                        }, function() {
                            setTimeout(function() {
                                checkIfHovered($previewer, function() {
                                    $previewer_container.fadeOut();
                                    $previewer.find('iframe').remove();
                                })
                            }, 100)
                        });
                    }
                }
            });

            setTimeout(function() { scanLinks() }, 5000);
        }
        scanLinks();
    }
});

// UTILS =============================================== //

function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}

function hoverDelay($el, fn1, fn2) {
    $el.hover(function() {
        window.hoverTimeout = setTimeout(function() {
            if (fn1) fn1();
        }, hover_delay_interval)
    }, function() {
        clearTimeout(window.hoverTimeout)
        if (fn2) fn2();
    })
}

function checkIfHovered($el, callback) {
    if ($el.is(":hover")) {
        setTimeout(function() { checkIfHovered($el, callback) }, 100)
    } else {
        callback();
    }
}

function getParmFromHash(url, parm) {
    var re = new RegExp("[?&]" + parm + "=([^&]+)(&|$)");
    var match = url.match(re);
    return(match ? match[1] : "");
}

function shadeRGBColor(color, percent) {
    var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
    return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
}
