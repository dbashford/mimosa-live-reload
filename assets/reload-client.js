(function() {
  var socket;

  function startSocket() {
    socket = io.connect('http://localhost');
    socket.on('page',       reloadPage)
          .on('css',        reloadCss)
          .on('reconnect',  reloadPage)
          .on('remove', disconnect);
  }

  function reloadPage() {
    location.reload();
  }

  function reloadCss() {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var tag = links[i];
      if (tag.rel.toLowerCase().indexOf("stylesheet") >= 0 && tag.href) {
        var newHref = tag.href.replace(/(&|%5C?)\d+/, "");
        tag.href = newHref + (newHref.indexOf("?") >= 0 ? "&" : "?") + (new Date().valueOf());
      }
    }
    console.log('CSS updated');
  }

  function disconnect() {
    socket.socket.transport.websocket.close();
    setTimeout(reloadPage, 4000)
  }

  startSocket();

})();