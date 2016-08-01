# ember-preprints

This is the prototype of the upcoming OSF preprints.
This guide will help you get started if you're interested.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation
* `git clone https://github.com/CenterForOpenScience/ember-osf.git` the application off which this is built
* `git clone <repository-url>` this repository
* `cd preprint_service` change into the new directory
*  follow [ember-osf](https://github.com/CenterForOpenScience/ember-osf) instructions for using code in a consuming app and configuration
* `npm install`
* `bower install`

## Running / Development
For local development, this is designed to run alongside (and from within) the flask application for osf.io.

1. Define the same route in the flask application (`routes.py`) and the ember application (`router.js`). 
2. Build the assets from a location that the flask application can serve, using the following command (adjusted for your own local directory structure):
 `ember build --output-path ../osf.io/website/static/public/ember-preprints/ --watch`
3. Visit your app at http://localhost:5000/preprints/

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

