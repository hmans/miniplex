'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./miniplex.cjs.prod.js");
} else {
  module.exports = require("./miniplex.cjs.dev.js");
}
