/* eslint-env node */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const configFunc = require('./config/environment');
const fs = require('fs');
const path = require('path');


module.exports = function(defaults) {
    const EMBER_VERSION = defaults.project.addonPackages['ember-source'].pkg.version;
    const JQUERY_VERSION = require('jquery/package.json').version;

    // Values chosen abritrarily, feel free to change
    const LEAN_BUILD = ['production'].includes(EmberApp.env());

    // EmberApp.env() will pull from the envvar EMBER_ENV or the command line flags
    const config = configFunc(EmberApp.env());

    const css = {app: '/assets/preprint-service.css'};
    const brands = fs.readdirSync('./app/styles/brands');
    for (const brand of brands) {
        if (/^_/.test(brand))
            continue;

        const brandId = brand.replace(/\..*$/, '');
        Object.assign(css, { [`brands/${brandId}`]: `/assets/css/${brandId}.css` });
    }

    // Reference: https://github.com/travis-ci/travis-web/blob/master/ember-cli-build.js
    const app = new EmberApp(defaults, {
        sourcemaps: {
            enabled: true,
            extensions: ['js']
        },
        minifyJS: {enabled: LEAN_BUILD},
        minifyCSS: {enabled: LEAN_BUILD},
        vendorFiles: !LEAN_BUILD ? {} : {
            // These will be CDN'd in via "inlineContent"
            // Ember doesn't like it when these are set to true for some reason
            'handlebars.js': false,
            'ember.js': false,
            'jquery.js': false,
        },
        'ember-bootstrap': {
              bootstrapVersion: 3,
              importBootstrapCSS: false,
              importBootstrapFont: true
        },
        'ember-font-awesome': {
            includeFontAwesomeAssets: false,
            includeFontFiles: false,
        },
        // Needed for branded themes
        fingerprint: {
            customHash: config.ASSET_SUFFIX
        },
        outputPaths: {
            app: { css }
        },
        sassOptions: {
            includePaths: [
                'bower_components/bootstrap-daterangepicker',
                'node_modules/@centerforopenscience/ember-osf/addon/styles',
                'node_modules/@centerforopenscience/osf-style/sass',
                'node_modules/hint.css/src',
            ]
        },
        inlineContent: {
            raven: {
                // Only include raven in production builds, because why not
                enabled: EmberApp.env() === 'production',
                content: `
                <script src="https://cdn.ravenjs.com/3.5.1/ember/raven.min.js"></script>
                <script>Raven.config("${config.sentryDSN}", {}).install();</script>`
            },
            cdn: {
                enabled: LEAN_BUILD,
                content: `
                <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/${JQUERY_VERSION}/jquery.min.js"></script>
                <script src="//cdnjs.cloudflare.com/ajax/libs/ember.js/${EMBER_VERSION}/ember.prod.js"></script>
                `
            },
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

    // app.import('bower_components/dropzone/dist/dropzone.js');
    app.import({
        development: path.join(app.bowerDirectory, 'dropzone/dist/dropzone.css'),
        production: path.join(app.bowerDirectory, 'dropzone/dist/min/dropzone.min.css')
    });

    app.import(path.join(app.bowerDirectory, 'jquery.tagsinput/src/jquery.tagsinput.js'));
    app.import(path.join(app.bowerDirectory, 'bootstrap-daterangepicker/daterangepicker.js'));
    app.import('vendor/bootstrap-carousel.js');

    const assets = [
        new Funnel('node_modules/@centerforopenscience/osf-style/img', {
            srcDir: '/',
            destDir: 'img',
        })
    ];

    return app.toTree(assets);
};
