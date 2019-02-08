'use strict';

module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    "@babel/plugin-external-helpers",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-transform-regenerator", {
      "asyncGenerators": false,
      "generators": false,
      "async": true,
    }]
  ]
};
