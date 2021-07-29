# ember-osf-preprints

`master` Build Status: ![Master Build Status](https://github.com/CenterForOpenScience/ember-osf-preprints/workflows/CI/badge.svg?branch=master)

`develop` Build Status: ![Develop Build Status](https://github.com/CenterForOpenScience/ember-osf-preprints/workflows/CI/badge.svg?branch=develop)

[![Coverage Status](https://coveralls.io/repos/github/CenterForOpenScience/ember-osf-preprints/badge.svg?branch=develop)](https://coveralls.io/github/CenterForOpenScience/ember-osf-preprints?branch=develop)

This is the codebase for OSF preprints.
This guide will help you get started if you're interested.

## Prerequisites

You will need the following things properly installed on your computer.

-   [Git](http://git-scm.com/)
-   [Node.js](http://nodejs.org/) (preferably via [nvm](https://github.com/creationix/nvm#install-script))
-   [Yarn](https://yarnpkg.com/)
-   [Bower](http://bower.io/)
-   [Ember CLI](http://ember-cli.com/)

## Installation

-   `git clone` this repository
    -   To pull in local preprint provider assets as well, use `git clone --recursive` instead (assuming you are using git >= 1.6.5).
-   `yarn install --frozen-lockfile`
-   `bower install`

## Preprint Provider Assets

If you will be using local preprint provider assets (rather than the CDN):

1. If you did not clone the repository using `--recursive`, run: `git submodule update --init --recursive`
2. Set the PROVIDER_ASSETS_URL environment variable to 'local'

### Updating Assets

-   To refresh your local assets, run: `git submodule update`
-   To update the assets submodule to the latest assets, run: `npm run update-assets`
-   To update to the latest assets and create a hotfix, run: `npm run updates-assets-hotfix`

## Running / Development

For local development, this is designed to run alongside (and from within) the flask application for osf.io.

1. Check out this OSF feature branch: https://github.com/CenterForOpenScience/osf.io/tree/feature/ember-preprints
2. Start your Ember server: `ember serve`
3. Copy [these lines](https://github.com/centerforopenscience/osf.io/blob/a98615b68a5cf620bc76c550808dd78ea3a305ec/website/settings/local-dist.py#L18-L22)
   to your `website/settings/local.py` file. Uncomment `'/preprints/': 'http://localhost:4200',` and restart your flask app.
4. Visit your app at http://localhost:5000/preprints/

### Provider Domains

1. Start the API server
1. Run `sudo ./scripts/add-domains.js`. This will add the domains to your `/etc/hosts`. Use `--dry` for a dry run.
1. Visit your app at one of the provider domains with `https://local.<domain>:4200` (e.g. `http://local.socarxiv.org:4200`)

If you encounter problems, make sure that your version of ember-osf is up to date. If login fails, try logging in from
any other OSF page, then returning to the preprints app.

### Generating test data on the OSF

There are a few scripts to run to populate your local preprint providers list, and help generate some "fake" preprints locally so you can begin testing using the OSF API.

-   Populate the OSF's PreprintProvider model with data:

`python -m scripts.populate_preprint_providers`

-   Populate the OSF's Subject model with data:

`python -m scripts.update_taxonomies`

-   Create "fake" preprints using some additional arguments to the `create_fakes` script:

`python -m scripts.create_fakes -u user@email.io --nprojects 2 --preprint True --preprintprovider osf,psyarxiv`

_notes_: You can enter as many providers as you like, separated by commas. Also, this script does not currently create actual fake files, only fake file metadata; the file itself won't render in a preprint view, but you can still request its information from the API.

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

You can run tests either with ember installed on your machine or by using [Docker](https://docs.docker.com/engine/getstarted/step_one/)

#### On your local machine

-   `ember test`
-   `ember test --server`

#### With Docker

-   `docker build --tag preprints .`
-   `docker run preprints`

### Building

-   `ember build` (development)
-   `ember build --environment production` (production)

## Further Reading / Useful Links

-   [Requirements and road map for this service](https://docs.google.com/spreadsheets/d/1SocElbBjc_Nhme4-SJv2_zytBd1ys8R5aZDb3POe94c/edit#gid=1340026270)
-   [ember.js](http://emberjs.com/)
-   [ember-cli](http://ember-cli.com/)
-   Development Browser Extensions
    -   [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
    -   [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
