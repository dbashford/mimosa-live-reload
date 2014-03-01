"use strict"

exports.defaults = ->
  liveReload:
    enabled:true
    additionalDirs:["views"]

exports.placeholder = ->
  """
  \t

    liveReload:                   # Configuration for live-reload
      enabled:true                # Whether or not live-reload is enabled
      additionalDirs:["views"]    # Additional directories outside the watch.compiledDir
                                  # that you would like to have trigger a page refresh,
                                  # like, by default, static views. Is string path,
                                  # can be relative to project root, or absolute
  """

exports.validate = (config, validators) ->
  errors = []

  if validators.ifExistsIsObject(errors, "liveReload config", config.liveReload)
    validators.ifExistsIsBoolean(errors, "liveReload.enabled", config.liveReload.enabled)
    validators.ifExistsArrayOfMultiPaths(errors, "liveReload.additionalDirs", config.liveReload.additionalDirs, config.root)

  if config.isBuild
    config.liveReload.enabled = false

  errors
