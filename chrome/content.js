// Content

var MOUSEPRESS_TIME = 500;

$(function() {

    // Check to see that we're not on an secured site, otherwise this thing wont work
    
    var $previewer_container = $('<div id="link-previewer-container"></div>');
    var $previewer = $('<div id="link-previewer"></div>');

    $previewer_container.append($previewer);
    $('body').append($previewer_container);

    function scanLinks() {
        $('a').each(function() {
            var $this = $(this);

            if ($this.hasClass('scanned-by-link-previewer')) return;

            $this.addClass('scanned-by-link-previewer');

            var url = $(this).attr('href');
            

            if(!url || isBlacklisted(url) || !isExternal(url)) return;



            $this.css({
              'border-bottom': '1px dashed '+ $this.css('color').replace('rgb', 'rgba').replace(')', ', 0.15)'),
              'text-decoration': 'none',
            });

            if($this.css('backgroundColor') === 'rgba(0, 0, 0, 0)') !$this.css({'backgroundColor': $this.css('color').replace('rgb', 'rgba').replace(')', ', 0.03)') });

            longPress($this, function() {
                onActivated(url, $this);
            });
        });
        setTimeout(function() { scanLinks(); }, 5000);
    }
    scanLinks();

    function onActivated(url, $this) {
        
        chrome.extension.sendMessage({"url": url});
        var video_id = null;
        
        // URL IS AN IMAGE
        if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
            var image = new Image();
            image.src = url;
            $previewer.html(image);
            $(image).load(function() {
                $previewer.css({ 'height': image.height, 'width': image.width });
            });
        }
        else if ($this[0].host === 'vimeo.com') {
            video_id = $this[0].pathname.replace('/', '');
            $previewer.html('<iframe src="//player.vimeo.com/video/' + video_id + '?color=c9ff23" width="1068" height="600" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
            $previewer.css({ 'width': '1068', 'height': '600' });
        }
        else if ($this[0].host === 'www.youtube.com') {
            video_id = getParmFromHash(url, 'v');
            $previewer.html('<iframe src="//www.youtube.com/embed/'+ video_id +'"></iframe>');
            $previewer.css({ 'width': '1067', 'height': '600' });
        }

        else if ($this[0].host === 'youtu.be') {
            video_id = $this[0].pathname.replace('/', '');
            $previewer.html('<iframe src="//www.youtube.com/embed/'+ video_id +'"></iframe>');
            $previewer.css({ 'width': '1067', 'height': '600' });
        }

        // URL IS AN EXTERNAL LINK
        else {
            var $iframe = $('<iframe src="'+ url +'"></iframe>');
            var $loading = $('<p class="loading">Loading...</p>');

            $previewer
                .css({ 'width': window.innerWidth - 300, 'height': window.innerHeight - 100 })
                .html('')
                .append($loading)
                .append($iframe);

            $iframe.hide().load(function() {
               $loading.hide();
               $iframe.fadeIn();
            });

            // Test URL for errors
            $.get(url).success(function(data, status, request) {
                var headers = request.getAllResponseHeaders();

                if (/sameorigin/i.test(headers) || /deny/i.test(headers)) {
                    $previewer.html('<p class="previewer_error">Failed to load this site</p><p class="previewer_link">Go directly to <a target="_blank" class="scanned-by-link-previewer" href="' + url + '">'+ url +'</a>');
                }
            });
        }
        showPreviewer();    
    }
    
    function showPreviewer() {
        setTimeout(function() {
            if ($previewer.height() < window.innerHeight) {
                $previewer.css({ 'top': '50%', 'margin-top': -$previewer.height() / 2, 'margin-left': -$previewer.width() / 2 });
            } else {
                $previewer.css({'top':'50px', 'margin-top': '0', 'margin-left': -$previewer.width() / 2 });
            }
            $previewer_container.fadeIn();
        }, 100);

        $previewer_container.click(function() {
            hidePreviewer();
        });
    }

    function hidePreviewer() {
        $previewer_container.fadeOut();
        $previewer.find('iframe').remove();
    }

    function longPress($el, fn1) {

        var long_clicked = false;

        $el.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        $el.on("mousedown", function(e) {
            var $this = $(this);
            long_clicked = false;
            $this.data("checkdown", setTimeout(function () {
                console.log('lognpresse');
                long_clicked = true;
                fn1();
            
            }, MOUSEPRESS_TIME ));
            
        })
        .on("mouseup", function(e) {
            clearTimeout($(this).data("checkdown"));
            if(!long_clicked) {
                window.open($el.attr('href'));
                long_clicked = false;
            }
        })
        .on("mouseout", function() {
            long_clicked = false;
            clearTimeout($(this).data("checkdown"));
        });
    }
});

// UTILS =============================================== //

function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}

function isBlacklisted(url) {
    if (url.indexOf('.zip') > 0 || url.indexOf('mailto') > 0 || window.location.protocol === "https:" && !/https:/i.test(url)) {
        return true;
    } else {
    
        return false;
    }
}

function getParmFromHash(url, parm) {
    var re = new RegExp("[?&]" + parm + "=([^&]+)(&|$)");
    var match = url.match(re);
    return(match ? match[1] : "");
}
