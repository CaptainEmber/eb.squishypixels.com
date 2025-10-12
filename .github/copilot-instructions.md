## Purpose
Short, focused instructions to help an AI coding agent become productive in this repo (a networked A-Frame/WebXR demo built around a fork of Networked-Aframe).

## Big-picture architecture (why/how)
- Runtime: browser-based A-Frame scenes (static HTML files at repo root) use the local `src/` library (CommonJS modules) to provide a Networked-AFrame-like runtime.
- Core globals: `src/NafIndex.js` exposes a single global `NAF` object (NAF.entities, NAF.connection, NAF.adapters, NAF.schemas, NAF.log, NAF.utils).
- Responsibilities:
  - `src/NetworkConnection.js` — connection lifecycle, datachannel management, and broadcasting.
  - `src/NetworkEntities.js` — entity lifecycle, first-sync handling, persistent entities, and parent/child instancing.
  - `src/Schemas.js` — template/schema registration and template cloning (expects `<template>` elements in the scene).
  - `src/adapters/*` — adapter implementations (socketio, webrtc, easyrtc, uws, wseasyrtc) and the `AdapterFactory` used to make/register adapters.
- Server: `server/socketio-server.js` is a minimal socket.io server used by the `socketio` adapter. It runs on port 8080 by default.

## Important project-specific patterns
- Template/schema registration: use `NAF.schemas.add({ template: '<selector>', components: [...] })` after `<a-scene>` and `<template>` assets exist. `Schemas.getCachedTemplate()` clones `template.content` and expects templates to have 0 or 1 child elements.
- Reserved data channels: Network messages for entity sync use reserved short keys (`'u'` update, `'um'` update multi, `'r'` remove) — see `NetworkConnection.setupDefaultDataSubscriptions()`.
- Persistent-first-sync behavior: if an entity is persistent, first-sync data is stashed into `NetworkEntities._persistentFirstSyncs` and replayed when the local scene creates the persistent entity.
- Child ordering: a child cache (`ChildEntityCache`) is used to defer instantiation if a parent is not yet present — this is the canonical way parent/child remote instantiation is handled.
- Adapter expectations: some adapters (e.g., `naf-socketio-adapter.js`) expect client libs like socket.io client to be present on the page (`io` global). The server counterpart is in `server/socketio-server.js`.

## Key files to inspect or modify (quick index)
- `src/NafIndex.js` — NAF global bootstrap
- `src/NetworkConnection.js` — connect(), broadcastData(), sendData(), datachannel callbacks
- `src/NetworkEntities.js` — createRemoteEntity(), updateEntity(), persistent first-syncs
- `src/Schemas.js` — template validation and caching
- `src/options.js` — project-level flags (debug, updateRate, useLerp, firstSyncSource, syncSource)
- `src/adapters/*` — adapter implementations; register new adapters with `NAF.adapters.register(name, AdapterClass)` or instantiate with `NAF.adapters.make(name)`
- `server/socketio-server.js` — simple socket.io server used for local testing
- `index.html`, `viewer.html`, `room2.html`, etc. — example scenes that load the runtime

## How to run locally (developer workflow)
1. Install dependencies (repo contains a minimal `package.json`):
```powershell
npm install
```
2. Run the socket.io server for the `socketio` adapter (default port 8080):
```powershell
node server/socketio-server.js
```
3. Open a scene in your browser (e.g., `index.html`) via a static server. A quick way is to open the file directly, or serve the folder (many editors/IDE live-servers work). The socket adapter will auto-detect `location.host` if `serverUrl` is `/` or empty.

Notes:
- The codebase assumes the library files in `src/` are loaded into the page (CommonJS modules are required from the top-level `src/index.js` which bundles components). If you use a bundler, ensure `src/index.js` is included.
- There is optional dev middleware in `server/socketio-server.js` for a webpack dev flow when `NODE_ENV=development` and a `webpack.config` exists — however this repo does not ship a webpack config by default. Use the simple server above unless you intentionally add a bundler.

## Small examples (how to call common APIs)
- Connect the client to a room:
```js
// run from browser context after NAF is loaded
NAF.log.setDebug(true); // enable logs
NAF.connection.setNetworkAdapter( NAF.adapters.make('socketio') ); // optional manual wiring
NAF.connection.connect('ws://localhost:8080', 'myApp', 'roomName', true, true)
```
- Register a schema/template (after scene + template exist):
```js
NAF.schemas.add({ template: '#my-template', components: ['position','rotation','my-custom'] });
```

## Common pitfalls & troubleshooting hints
- Missing template: `Schemas.getCachedTemplate()` logs an error if the `<template>` selector isn't present — ensure templates are inside `<a-assets>` and registered after `<a-scene>`.
- Adapter mismatch: the client adapter may expect a specific server (Socket.io vs EasyRTC). Match the adapter name (see `src/adapters/AdapterFactory.js`) with the running server.
- Time sync: `naf-socketio-adapter` attempts to estimate server time via HTTP HEAD Date header — if hosting behind proxies, time offsets may vary.
- Ownership vs persistence: persistent entities are not deleted when owners disconnect; code tries to reassign ownership. Look in `NetworkEntities.removeEntitiesOfClient()` for that logic.

## What to change when adding features
- For new network messages, avoid reserved short keys (`'u'`, `'um'`, `'r'`); use descriptive custom channel names via `NAF.connection.subscribeToDataChannel()`.
- Add adapter implementations under `src/adapters/` and register with `NAF.adapters.register('name', AdapterClass)`.

If any section is unclear or you want examples added (tests, a sample scene wiring a custom component, or a short dev Dockerfile), tell me which part to expand and I'll iterate.
