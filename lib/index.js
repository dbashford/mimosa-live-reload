"use strict";
var clientLibOutPath, clientLibText, config, connect, directoryWatchSetup, disconnect, fs, logger, path, registration, socketio, sockets, watch, _emit, _refreshPage, _removeClientLibrary, _setupDirectoryWatch, _writeClientLibrary;

path = require('path');

fs = require('fs');

logger = require('logmimosa');

watch = require('chokidar');

socketio = require('socket.io');

config = require('./config');

clientLibOutPath = null;

clientLibText = null;

sockets = {};

directoryWatchSetup = false;

registration = function(mimosaConfig, register) {
  register(['preClean'], 'init', _removeClientLibrary);
  clientLibOutPath = path.join(mimosaConfig.watch.compiledJavascriptDir, 'reload-client.js');
  clientLibText = fs.readFileSync(path.join(__dirname, 'assets', 'reload-client.js'), 'ascii');
  if (mimosaConfig.isServer) {
    if (!mimosaConfig.liveReload.enabled) {
      return logger.debug("Live-Reload is turned off, not registering reload functionality.");
    }
    register(['postBuild'], 'afterServer', _writeClientLibrary);
    register(['postBuild'], 'afterServer', connect);
    register(['add', 'update', 'remove'], 'afterWrite', _writeClientLibrary);
    return register(['add', 'update', 'remove'], 'afterWrite', _refreshPage);
  }
};

disconnect = function() {
  var socket, socketId, _results;
  _results = [];
  for (socketId in sockets) {
    socket = sockets[socketId];
    _results.push(socket.disconnect());
  }
  return _results;
};

connect = function(mimosaConfig, options, next) {
  var io;
  if (options.userServer == null) {
    return logger.warn("Live-Reload module is configured, but is unable to find your server.  Did you forget to return it from your startServer function? Disabling Live-Reload.");
  }
  io = options.socketio != null ? (logger.debug("Using user's socketio"), options.socketio) : (logger.debug("Using module's socketio"), io = socketio.listen(options.userServer), io.enable('browser client minification'), io.enable('browser client etag'), io.set('log level', 1), io);
  io.sockets.on('connection', function(socket) {
    socket.on('disconnect', function() {
      if (sockets[socket.id]) {
        return delete sockets[socket.id];
      }
    });
    return sockets[socket.id] = socket;
  });
  if (!directoryWatchSetup) {
    _setupDirectoryWatch(mimosaConfig.liveReload.additionalDirs);
  }
  return next();
};

_setupDirectoryWatch = function(dirsToWatch) {
  var watcher;
  if ((dirsToWatch != null) && (dirsToWatch.length != null) > 0) {
    directoryWatchSetup = true;
    watcher = watch.watch(dirsToWatch, {
      persistent: true
    });
    watcher.on('all', function() {
      return _emit('page');
    });
    return watcher.on('error', function(error) {});
  }
};

_writeClientLibrary = function(mimosaConfig, options, next) {
  if (options.userServer != null) {
    return fs.exists(clientLibOutPath, function(exists) {
      if (exists) {
        return next();
      } else {
        logger.debug("Writing live reload client library to [[ " + clientLibOutPath + " ]]");
        return fs.writeFile(clientLibOutPath, clientLibText, 'ascii', function(err) {
          if (err) {
            logger.error(err);
          }
          return next();
        });
      }
    });
  } else {
    return next();
  }
};

_removeClientLibrary = function(mimosaConfig, options, next) {
  return fs.exists(clientLibOutPath, function(exists) {
    if (exists) {
      return fs.unlink(clientLibOutPath, function(err) {
        if (err) {
          logger.error("Error occured removing client library: " + err);
        } else {
          logger.info("mimosa-live-reload: removed live reload client.");
        }
        return next();
      });
    } else {
      return next();
    }
  });
};

_refreshPage = function(mimosaConfig, options, next) {
  var type;
  type = options.isCSS ? "css" : "page";
  _emit(type);
  return next();
};

_emit = function(type) {
  logger.debug("Sending message to client to refresh page for type [[ " + type + " ]]");
  return Object.keys(sockets).forEach(function(s) {
    return sockets[s].emit(type);
  });
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate,
  connect: connect,
  disconnect: disconnect
};
