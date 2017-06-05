"use strict";

const lib = require("./dist");

module.exports = lib.default;

for (let p in lib) {
  if (!module.exports.hasOwnProperty(p)) module.exports[p] = lib[p];
}

Object.defineProperty(module.exports, "__esModule", {value: true});
