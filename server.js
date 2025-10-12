const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const NAF = require('networked-aframe');

// Serve static files
app.use(express.static(__dirname));

// HTTPS redirect middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Initialize Networked A-Frame
NAF.require('naf-server').listen(http, { path: '/' });

const port = process.env.PORT || 8080;
http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});