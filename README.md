mimosa-live-reload
===========

This is a live reload module for the Mimosa build tool. This module will immediately refresh a page or reevaluate your CSS when an asset is compiled or a view changes. This module does not require browser plugins or modules to function.

For more information regarding Mimosa, see http://mimosa.io.

# Usage

Add `'live-reload'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

This module depends on mimosa-server. Currently no other Mimosa module accomplishes what mimosa-live-reload needs in order to have proper access to the dev server.

# Functionality

This module is responsible for refreshing your browser assets when they are updated in your codebase.

Reloading UI assets when they change make sound like a fairly small nice-to-have feature, but it quickly becomes one of the handiest time savers in your workflow. mimosa-live-reload is often fast enough to get the page reloaded/refreshed before the browser can be toggled to.

### JavaScript vs CSS

mimosa-live-reload handles CSS and JavaScript assets differently. For CSS the page does not need a full reload. The new CSS is re-evaluated without reloading anything other than the CSS. The page is simply repainted. When JavaScript assets are updated, the entire page refreshes.

# Integration into your application

### Starting with `mimosa new`?

If `mimosa new` was used to create the project, then live reload will already be included. This module is a part of the creation of the `mimosa new` project.

### Adding mimosa-live-reload to existing project?

If enabling it on an existing project, some minor things need to change on both the client and server for mimosa-live-reload to function.

One great way to figure out how to add live-reload to your application is to create a `mimosa new` app and see the very simple ways in which it is wired up.  Below the wiring points are described.

#### Client Scripts

For live reload to work, two scripts need to be added to the page. Neither of the scripts are ones you need to provide, but you do need to make sure they are brought in. If using dynamic templating for views, then the scripts need to be included for development and not included when in production.

The paths to use for the two scripts are:

* `/socket.io/socket.io.js`: This is socket.io. mimosa-live-reload will serve this file, so it need not be in the project's codebase, but a script tag must pull it in. socket.io is what allows instant communication of server-side changes to the client. socket.io will emit events on the client that indicate that a JavaScript or CSS file has changed.
* `/javascripts/reload-client.js`: This is a small piece of code that reacts to events emitted by socket.io. When it hears from socket.io that a piece of CSS has changed, it reloads the CSS. When it hears that some JavaScript has changed, it refreshes the page. This file will be placed in your output directory by mimosa-live-reload.

Example with jade
```
if reload
  script(src='/socket.io/socket.io.js')
  script(src='/javascripts/reload-client.js')
```

Example with handlebars
```
{{#reload}}
  <script src="/socket.io/socket.io.js"></script>
  <script src="/javascripts/reload-client.js"></script>
{{/reload}}
```

#### On the server

If Mimosa is serving assets (via [mimosa-server](https://github.com/dbashford/mimosa-server)), there is nothing to do on the server.

If running a node server that Mimosa is starting (i.e. you are using the [mimosa-server](https://github.com/dbashford/mimosa-server) module), then the callback that mimosa-server passes `startServer` needs to be passed the http server object. This is the same object returned by `require('http').createServer()` and by `express().listen()``. The mimosa-live-reload module needs access to the server to establish a connection between the socket.io client and the server.

### Already using socket.io in your server?

The mimosa-live-reload module uses socket.io in conjunction with the server passed to the `startServer` callback function to provide live reload functionality. But if socket.io is already being used by your application, the mimosa-live-reload's socket.io and yours will clash.

If socket.io is already being used, then it must also be given to the callback function executed at the end of `startServer`. The first parameter passed to the callback should be the server, and the second should be the object returned by `socketio.listen(server)`. If this object is provided, mimosa-live-reload will not create its own socketio connection, and instead use the one it is passed.

### Chrome Extension?

There is a [Chrome Extension](https://github.com/ifraixedes/chrome-extension-mimosa-livereload) that can provide live reload without needing to embed scrips on your page in your app. It embeds them in the browser.

### Using another Chrome Extension?

If you are having trouble getting Live Reload working such that you are seeing things like this in your console:

> GET http://127.0.0.1:35729/livereload.js?ext=Chrome&extver=2.0.9 net::ERR_CONNECTION_REFUSED

Then you may need to disable your existing live reload plugin. mimosa-live-reload is purposefully built to not need plugins and existing plugins may interfere with it.

# Default Config

```javascript
liveReload: {
  enabled: true,
  additionalDirs:["views"]
}
```

#### `liveReload.enabled` boolean
This property determines whether or not live reload is enabled. When `true`, live-reload will start when you start your server and it will deposit the live reload client script in your output directory.

#### `liveReload.additionalDirs` array of strings
A list of additional directories to cause live reload to refresh the browser. Paths in the array can be absolute or relative to the root of the project. By default this is set to `["views"]`, which means a change to anything in the `views` directory will cause the browser to refresh.

