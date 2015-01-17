(function() {
  var scripts = document.getElementsByTagName("script");
  var socket = io.connect(
    (function() { for(var i=0;i<scripts.length;i++) { if(scripts[i].src && scripts[i].src.indexOf("/socket.io.js") > -1)
      return (/^([^#]*?:\/\/.*?)(\/.*)$/.exec(scripts[i].src) || [])[1];
    } })()
  );
  socket.on('page',       reloadPage)
        .on('css',        reloadCss)
        .on('reconnect',  reloadPage);

  function reloadPage() {
    location.reload();
  }

  function reloadCss() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var original = links[i];
      if (original.rel.toLowerCase().indexOf("stylesheet") >= 0 && original.href) {
        var newHref = original.href.replace(/(&|%5C?)\d+/, "");
        original.href = newHref + (newHref.indexOf("?") >= 0 ? "&" : "?") + (new Date().valueOf());

        // Clone the link node and swap it out for the original
        var clone = original.cloneNode();
        var parent = original.parentNode;
        var neighbor = original.nextSibling;
        parent.insertBefore(clone, neighbor);
        parent.removeChild(original);
      }
    }
    console.log('CSS updated');
  }

})();
