"use strict";
exports.defaults = function() {
  return {
    liveReload: {
      enabled: true,
      additionalDirs: ["views"]
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n  liveReload:                   # Configuration for live-reload\n    enabled:true                # Whether or not live-reload is enabled\n    additionalDirs:[\"views\"]    # Additional directories outside the watch.compiledDir\n                                # that you would like to have trigger a page refresh,\n                                # like, by default, static views. Is string path,\n                                # can be relative to project root, or absolute";
};

exports.validate = function(config, validators) {
  var errors;
  errors = [];
  if (validators.ifExistsIsObject(errors, "liveReload config", config.liveReload)) {
    validators.ifExistsIsBoolean(errors, "liveReload.enabled", config.liveReload.enabled);
    validators.ifExistsArrayOfMultiPaths(errors, "liveReload.additionalDirs", config.liveReload.additionalDirs, config.root);
  }
  if (config.isBuild) {
    config.liveReload.enabled = false;
  }
  return errors;
};
