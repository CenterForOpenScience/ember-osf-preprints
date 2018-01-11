# ember-osf-preprints

`master` Build Status: [![Build Status](https://travis-ci.org/CenterForOpenScience/ember-osf-preprints.svg?branch=master)](https://travis-ci.org/CenterForOpenScience/ember-osf-preprints)

`develop` Build Status: [![Build Status](https://travis-ci.org/CenterForOpenScience/ember-osf-preprints.svg?branch=develop)](https://travis-ci.org/CenterForOpenScience/ember-osf-preprints)

[![Coverage Status](https://coveralls.io/repos/github/CenterForOpenScience/ember-osf-preprints/badge.svg?branch=develop)](https://coveralls.io/github/CenterForOpenScience/ember-osf-preprints?branch=develop)

This is the codebase for OSF preprints.
This guide will help you get started if you're interested.

# Setup using Docker via osf.io

## Prerequisites

* Follow the [docker setup instructions](https://github.com/CenterForOpenScience/osf.io/blob/develop/README-docker-compose.md) for [osf.io](https://github.com/centerforopenscience/osf.io) repo

* Follow the instructions for installing the [ember-osf](https://github.com/CenterForOpenScience/ember-osf/) repo

## Installation

* `git clone` the ember-osf-preprints repo into the same directory as your osf.io and ember-osf repos

e.g.,
```
+-- osf_projects
|   +-- osf.io
|   +-- ember-osf
|   +-- ember-osf-preprints
```

## Modify docker-sync.yml
In your osf.io [docker-sync.yml](https://github.com/CenterForOpenScience/osf.io/blob/develop/docker-sync.yml) uncomment the `preprints-sync` section:

```
preprints-sync:
  src: '../ember-osf-preprints'
  sync_strategy: 'native_osx'
  sync_args: [ '-prefer newer' ]
  sync_excludes_type: 'Name'
  sync_excludes: ['.DS_Store', '*.map', '*.pyc', '*.tmp', '.git', '.idea', 'bower_components', 'node_modules', 'tmp', 'dist']
  watch_excludes: ['.*\.DS_Store', '.*\.map', '.*\.pyc', '.*\.tmp', '.*/\.git', '.*/\.idea', '.*/bower_components', '.*/node_modules', '.*/tmp', '.*/dist']
```

## Modify docker-compose.override.yml
In your osf.io [docker-compose.override.yml](https://github.com/CenterForOpenScience/osf.io/blob/develop/docker-compose.override.yml) uncomment the `preprints` section:

```
preprints:
  volumes:
    - preprints-sync:/code:nocopy

    # Use this for ember-osf linked development (with docker-sync):
    - preprints_dist_vol:/code/dist
    - emberosf-sync:/ember-osf
  depends_on:
    - emberosf
  command:
    - /bin/bash
    - -c
    - cd /ember-osf &&
      yarn link &&
      cd /code &&
      (rm -r node_modules || true) &&
      yarn --frozen-lockfile &&
      yarn link @centerforopenscience/ember-osf &&
      (rm -r bower_components || true) &&
      ./node_modules/.bin/bower install --allow-root --config.interactive=false &&
      yarn start --host 0.0.0.0 --port 4201 --live-reload-port 41954
```

Also uncomment the `preprints-sync` section:

```
preprints-sync:
  external: true
```

## Rebuild docker containers and reset sync
If you have used docker-sync or used the quay preprints images with the osf.io repo before:

* In the OSF repo, run `docker-compose down` to remove all images
* Run `docker-sync stop`
* Run `docker-sync clean`
* Run `docker-sync start` to start the new sync services
* Bring back up all docker containers (NOTE: This may take a while) e.g., `docker-compose up -d --force-recreate --no-deps` for daemon mode

Once the containers are back up everything should be ready for development.

# Setup without Docker 
## NOTE: These instructions are likely out of date, Docker method preferred

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (preferably via [nvm](https://github.com/creationix/nvm#install-script))
* [Yarn](https://yarnpkg.com/)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)

## Installation

* `git clone` this repository
  * To pull in local preprint provider assets as well, use `git clone --recursive` instead (assuming you are using git >= 1.6.5).
* `yarn install --frozen-lockfile`
* `bower install`

## Preprint Provider Assets

If you will be using local preprint provider assets (rather than the CDN):

1. If you did not clone the repository using --recursive, run: `git submodule update --init --recursive`
2. Set the PROVIDER_ASSETS_URL environment variable to 'local'

### Updating Assets

* To refresh your local assets, run: `git submodule update`
* To update the assets submodule to the latest assets, run: `npm run update-assets`
* To update to the latest assets and create a hotfix, run: `npm run updates-assets-hotfix`

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

* Populate the OSF's PrerpintProvider model with data:

`python -m scripts.populate_preprint_providers`

* Populate the OSF's Subject model with data:

`python -m scripts.update_taxonomies`

* Create "fake" preprints using some additional arguments to the `create_fakes` script:

`python -m scripts.create_fakes -u user@email.io --nprojects 2 --preprint True --preprintprovider osf,psyarxiv`

*notes*: You can enter as many providers as you like, seperated by commas. Also, this script does not currently create actual fake files, only fake file metadata; the file itself won't render in a preprint view, but you can still request its information from the API.

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests
You can run tests either with ember installed on your machine or by using [Docker](https://docs.docker.com/engine/getstarted/step_one/)

#### On your local machine
* `ember test`
* `ember test --server`

#### With Docker
* `docker build --tag preprints .`
* `docker run preprints`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

## Further Reading / Useful Links

* [Requirements and road map for this service](https://docs.google.com/spreadsheets/d/1SocElbBjc_Nhme4-SJv2_zytBd1ys8R5aZDb3POe94c/edit#gid=1340026270)
* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

