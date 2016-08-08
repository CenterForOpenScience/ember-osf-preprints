/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        'ember-bootstrap': {
            importBootstrapCSS: false
        },
        sassOptions: {
            includePaths: [
                '../ember-osf/tests/dummy/app/components',
                '../ember-osf/addon/styles',
                'bower_components/bootstrap-sass/assets/stylesheets',
                'bower_components/osf-style/sass'
            ]
        },
        postcssOptions: {
            compile: {
                enabled: false
            },
            filter: {
                enabled: true,
                plugins: [{
                    module: require('autoprefixer'),
                    options: {
                        browsers: ['last 4 versions'],
                        cascade: false
                    }
                }, {
                    // Wrap progid declarations with double-quotes
                    module: require('postcss').plugin('progid-wrapper', () => {
                        return css =>
                            css.walkDecls(declaration => {
                                if (declaration.value.startsWith('progid')) {
                                    return declaration.value = `"${declaration.value}"`;
                                }
                            });
                    })
                }]
            }
        }
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
    app.import('bower_components/osf-style/vendor/prism/prism.css');
    app.import('bower_components/osf-style/page.css');

    app.import('bower_components/osf-style/img/cos-white2.png', {
        destDir: 'img'
    });

//  app.import('bower_components/dropzone/dist/dropzone.js');
    app.import({
        development: 'bower_components/dropzone/dist/dropzone.css',
        production: 'bower_components/dropzone/dist/min/dropzone.min.css'
    });

    app.import({
        development: 'bower_components/bootstrap-treeview/src/css/bootstrap-treeview.css',
        production: 'bower_components/bootstrap-treeview/dist//bootstrap-treeview.min.css'
    });
    app.import({
        development: 'bower_components/bootstrap-treeview/src/js/bootstrap-treeview.js',
        production: 'bower_components/bootstrap-treeview/dist/js/bootstrap-treeview.min.js'
    });
    app.import('bower_components/jquery.tagsinput/src/jquery.tagsinput.js');
    app.import('bower_components/jquery.tagsinput/src/jquery.tagsinput.css');

    return app.toTree();
};
