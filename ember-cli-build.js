/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // osf-style
  app.import("bower_components/osf-style/vendor/prism/prism.css");
  app.import("bower_components/osf-style/css/base.css");
  app.import("bower_components/osf-style/page.css");

  app.import("bower_components/osf-style/img/cos-white2.png", {
    destDir: 'vendor'
  });
  // Bootstrap
  app.import("bower_components/bootstrap/dist/css/bootstrap.min.css");
  app.import("bower_components/bootstrap/js/modal.js");

//  app.import("bower_components/dropzone/dist/dropzone.js");
  app.import("bower_components/dropzone/dist/min/dropzone.min.css");

  return app.toTree();
};
