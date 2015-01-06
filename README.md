mimosa-live-reload
===========

This is a live reload module for the Mimosa build tool. This module does not require browser plugins or modules to function.

For more information regarding Mimosa, see http://mimosa.io.

# Usage

Add `'live-reload'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

# Functionality

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

