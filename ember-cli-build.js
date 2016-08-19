/*jshint node:true*/
/* global require, module */
var path = require('path');
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        'ember-bootstrap': {
            importBootstrapCSS: false
        },
        sassOptions: {
            includePaths: [
                'node_modules/ember-osf/addon/styles',
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
        },
        // bable options included to fix issue with testing discover controller
        // http://stackoverflow.com/questions/32231773/ember-tests-passing-in-chrome-not-in-phantomjs
        babel: {
            optional: ['es6.spec.symbols'],
            includePolyfill: true
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
    app.import(path.join(app.bowerDirectory, 'osf-style/vendor/prism/prism.css'));
    app.import(path.join(app.bowerDirectory, 'osf-style/page.css'));
    app.import(path.join(app.bowerDirectory, 'osf-style/css/base.css'));

    app.import(path.join(app.bowerDirectory, 'osf-style/img/cos-white2.png'), {
        destDir: 'img'
    });

    // app.import('bower_components/dropzone/dist/dropzone.js');
    app.import({
        development: path.join(app.bowerDirectory, 'dropzone/dist/dropzone.css'),
        production: path.join(app.bowerDirectory, 'dropzone/dist/min/dropzone.min.css')
    });

    app.import(path.join(app.bowerDirectory, 'jquery.tagsinput/src/jquery.tagsinput.js'));

    app.import({
        development: path.join(app.bowerDirectory, 'bootstrap-treeview/src/css/bootstrap-treeview.css'),
        production: path.join(app.bowerDirectory, 'bootstrap-treeview/dist//bootstrap-treeview.min.css')
    });
    app.import({
        development: path.join(app.bowerDirectory, 'bootstrap-treeview/src/js/bootstrap-treeview.js'),
        production: path.join(app.bowerDirectory, 'bootstrap-treeview/dist/js/bootstrap-treeview.min.js')
    });

     app.import({
        development: path.join(app.bowerDirectory, 'hint.css/hint.css'),
        production: path.join(app.bowerDirectory, 'hint.css/hint.css')
    });

    return app.toTree();
};
