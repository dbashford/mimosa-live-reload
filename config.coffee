path = require "path"

"use strict"

windowsDrive = /^[A-Za-z]:\\/

exports.defaults = ->
  liveReload:
    enabled:true
    additionalDirs:["views"]

exports.placeholder = ->
  """
  \t

    # liveReload:                   # Configuration for live-reload
      # enabled:true                # Whether or not live-reload is enabled
      # additionalDirs:["views"]    # Additional directories outside the watch.compiledDir
                                    # that you would like to have trigger a page refresh,
                                    # like, by default, static views. Is string path,
                                    # can be relative to project root, or absolute
  """

exports.validate = (config) ->
  errors = []
  if config.liveReload?
    if typeof config.liveReload is "object" and not Array.isArray(config.liveReload)
      if config.liveReload.enabled?
        unless typeof config.liveReload.enabled is "boolean"
          errors.push "liveReload.enabled must be a boolean."

      if config.liveReload.additionalDirs?
        if Array.isArray(config.liveReload.additionalDirs)
          newAddDirs = []
          for dir in config.liveReload.additionalDirs
            if typeof dir is "string"
              newAddDirs.push __determinePath dir, config.root
            else
              errors.push "liveReload.additionalDirs must be an array of strings"
              break
          config.liveReload.additionalDirs = newAddDirs
        else
          errors.push "liveReload.additionalDirs must be an array"

    else
      errors.push "liveReload configuration must be an object."

  if config.isBuild
    config.liveReload.enabled = false

  errors

__determinePath = (thePath, relativeTo) ->
  return thePath if windowsDrive.test thePath
  return thePath if thePath.indexOf("/") is 0
  path.join relativeTo, thePath
