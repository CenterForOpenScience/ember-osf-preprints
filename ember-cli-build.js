/* eslint-env node */


const fs = require('fs');
const path = require('path');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const configFunc = require('./config/environment');
const Funnel = require('broccoli-funnel');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

const nonCdnEnvironments = ['development', 'test'];

const {
    EMBER_ENV,
} = process.env;

module.exports = function(defaults) {
    const config = configFunc(EMBER_ENV);
    const useCdn = !nonCdnEnvironments.includes(EMBER_ENV);

    const css = {
        app: '/assets/preprint-service.css',
    };

    const brands = fs.readdirSync('./app/styles/brands');

    for (const brand of brands) {
        if (/^_/.test(brand)) { continue; }

        const brandId = brand.replace(/\..*$/, '');
        Object.assign(css, { [`brands/${brandId}`]: `/assets/css/${brandId}.css` });
    }

    // Reference: https://github.com/travis-ci/travis-web/blob/master/ember-cli-build.js
    const app = new EmberApp(defaults, {
        sourcemaps: {
            enabled: true,
            extensions: ['js'],
        },
        vendorFiles: {
            // next line is needed to prevent ember-cli to load
            // handlebars (it happens automatically in 0.1.x)
            'handlebars.js': { production: null },
            [useCdn ? 'ember.js' : '']: false,
            [useCdn ? 'jquery.js' : '']: false,
        },
        'ember-bootstrap': {
            importBootstrapCSS: false,
        },
        // Needed for branded themes
        fingerprint: {
            customHash: config.ASSET_SUFFIX,
            extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'ico'],
        },
        outputPaths: {
            app: {
                css,
            },
        },
        sassOptions: {
            includePaths: [
                'node_modules/bootstrap-sass/assets/stylesheets',
                'node_modules/@centerforopenscience/ember-osf/addon/styles',
                'node_modules/@centerforopenscience/osf-style/sass',
                'node_modules/hint.css',
                'node_modules/bootstrap-daterangepicker',
            ],
        },
        inlineContent: {
            cdn: {
                enabled: useCdn,
                content: `
                    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
                    <script src="//cdnjs.cloudflare.com/ajax/libs/ember.js/2.18.0/ember.min.js"></script>
                `.trim(),
            },
        },
        postcssOptions: {
            compile: {
                enabled: false,
            },
            filter: {
                enabled: true,
                plugins: [{
                    module: autoprefixer,
                    options: {
                        browsers: ['last 4 versions'],
                        cascade: false,
                    },
                }, {
                    // Wrap progid declarations with double-quotes
                    module: postcss.plugin('progid-wrapper', () => {
                        return css =>
                            css.walkDecls((declaration) => {
                                if (declaration.value.startsWith('progid')) {
                                    const declarationValue = `"${declaration.value}"`;
                                    return declarationValue;
                                }
                            });
                    }),
                }],
            },
        },
        // bable options included to fix issue with testing discover controller
        // http://stackoverflow.com/questions/32231773/ember-tests-passing-in-chrome-not-in-phantomjs
        'ember-cli-babel': {
            includePolyfill: true,
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


    app.import('vendor/ember/ember-template-compiler.js');
    // osf-style

    // app.import('bower_components/dropzone/dist/dropzone.js');
    app.import({
        development: path.join('node_modules', 'dropzone/dist/dropzone.css'),
        production: path.join('node_modules', 'dropzone/dist/min/dropzone.min.css'),
    });

    app.import(path.join(app.bowerDirectory, 'jquery.tagsinput/src/jquery.tagsinput.js'));
    app.import(path.join('node_modules', 'bootstrap-daterangepicker/daterangepicker.js'));

    app.import({
        development: path.join('node_modules', 'hint.css/hint.css'),
        production: path.join('node_modules', 'hint.css/hint.css'),
    });

    // Import component styles from addon
    app.import('vendor/assets/ember-osf.css');

    const assets = [
        new Funnel('node_modules/@centerforopenscience/osf-style/img', {
            srcDir: '/',
            destDir: 'img',
        }),
    ];

    return app.toTree(assets);
};
