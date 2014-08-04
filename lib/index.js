"use strict";
var clientLibOutPath, clientLibText, config, connect, directoryWatchSetup, disconnect, fs, logger, path, registration, sockets, _emit, _makeDirectory, _refreshPage, _removeClientLibrary, _setupDirectoryWatch, _writeClientLibrary;

path = require('path');

fs = require('fs');

config = require('./config');

clientLibOutPath = null;

clientLibText = null;

sockets = {};

directoryWatchSetup = false;

logger = null;

registration = function(mimosaConfig, register) {
  logger = mimosaConfig.log;
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
  var io, socketio;
  if (options.userServer == null) {
    return logger.warn("Live-Reload module is configured, but is unable to find your server.  Did you forget to return it from your startServer function? Disabling Live-Reload.");
  }
  io = options.socketio != null ? (logger.debug("Using user's socketio"), options.socketio) : (logger.debug("Using module's socketio"), socketio = require('socket.io'), io = socketio.listen(options.userServer), io);
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
  var watch, watcher;
  if ((dirsToWatch != null) && (dirsToWatch.length != null) > 0) {
    watch = require('chokidar');
    directoryWatchSetup = true;
    watcher = watch.watch(dirsToWatch, {
      persistent: true
    });
    watcher.on('all', function(event, filePath) {
      var ext;
      ext = path.extname(filePath);
      if (ext === '.css') {
        return _emit('css');
      } else {
        return _emit('page');
      }
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
        _makeDirectory(path.dirname(clientLibOutPath));
        if (logger.isDebug()) {
          logger.debug("Writing live reload client library to [[ " + clientLibOutPath + " ]]");
        }
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

_makeDirectory = function(dir) {
  var wrench;
  if (!fs.existsSync(dir)) {
    if (logger.isDebug()) {
      logger.debug("Making folder [[ " + dir + " ]]");
    }
    wrench = require('wrench');
    return wrench.mkdirSyncRecursive(dir, 0x1ff);
  }
};

_refreshPage = function(mimosaConfig, options, next) {
  var type;
  type = options.isCSS ? "css" : "page";
  _emit(type);
  return next();
};

_emit = function(type) {
  if (logger.isDebug()) {
    logger.debug("Sending message to client to refresh page for type [[ " + type + " ]]");
  }
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
