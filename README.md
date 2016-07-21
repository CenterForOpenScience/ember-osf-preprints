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
Currently we are running our application using test.osf.io as the backend:
* `BACKEND=test ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

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
* [jamdb](https://github.com/CenterForOpenScience/jamdb)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

