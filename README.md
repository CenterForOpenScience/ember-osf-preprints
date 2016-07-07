# Preprint-service

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


## Using JamDB

[JamDB](https://github.com/CenterForOpenScience/jamdb) is a database that runs on MongoDB and ElasticSearch. The adapters/serializers/models in this ember app are currently set up for making calls to a locally run JamDB server.
The [jamDB documentation](https://jamdb.readthedocs.io/en/latest/install.html) provides the general steps needed for running JamDB locally and other background information on how the database is organized.

**Things to note**:
1. Make sure your jam virtual environment is running python3 `mkvirtualenv --python=python3.5 jam`

2. Make sure you are running vanilla Mongo and not Toku.
..* If you are coming from an OSF installation you may not have Mongo. The easiest way to rectify this is `brew install mongo`.
..* If you are creating a Mongo database for the first time you may have to create some new folders.
```sudo mkdir /data
   sudo mkdir /data/db
   sudo chmod -x /data/db
```
..* To run your new mongo server change to the directory with the executable. If you brew installed as above it's probably `cd /usr/local/Cellar/mongodb/3.2.7/bin` then run it `./mongod`

3. Don't forget to run elasicsearch! (If you have the OSF installed you can `invoke` it as you normally would to run it)

### Using JamDB

Below is a simple example of how to use the `jam` command line once you have your server up and running.

The `-h` (or `--help`) argument is applicable to all commands and is very useful for understanding how to use the jam cli. `jam -h` will give you an overview of what commands are available, but perhaps the most useful for getting setup are `jam create` and `jam update`. Let's start by creating a namespace.

```
jam create fruits
```

We now have a namespace called `fruits`. Namespaces at the broadest level of the hierarchy JamDB uses. We can subsequently create a collection within this namespace:

```
jam create fruits berries
```

We now have a collection called `berries` within the `fruits` namespace. The final level of the hierachy, below collections, are documents. Documents are essentially JSON objects that live inside collections. If we define an object in a file called `myFruit.json`, such as
```
{
    "color": "blue",
    "size": "small"
}
```
we can then create a document for this object by piping it into the `jam create` command:

```
cat myFruit.json | jam create fruits berries blueberry
```

That's it! Well, almost. We have data in JamDB, but we have to make sure we can access that data. For development purposes, it is perhaps easiest to allow anyone to READ your data. (We would definitely make sure to fine-tune permissions in the future, but this suffices for a quick start.) This is where `jam update` comes in:

```
jam update fruits -p "* READ"
```

Running `jam info fruits` should then confirm that `*` (all users) has READ permissions (in addition to the default `system-system-system` having ADMIN permissions). A GET to `http://localhost:1212/v1/id/documents/fruits.berries.blueberry` should then indeed return a payload like the following:

```
{
  "data": {
    "type": "documents",
    "meta": {
      "permissions": "READ",
      "modified-by": "system-system-system",
      "created-on": "2016-06-28T15:39:48.924705",
      "created-by": "system-system-system",
      "modified-on": "2016-06-28T15:39:48.924705"
    },
    "id": "fruits.berries.blueberry",
    "attributes": {
      "size": "small",
      "color": "blue"
    },
    "relationships": {
      "history": {
        "links": {
          "self": "http://localhost:1212/v1/id/documents/fruits.berries.blueberry/history",
          "related": "http://localhost:1212/v1/id/documents/fruits.berries.blueberry/history"
        }
      }
    }
  }
}
```

**A few things to keep in mind in regard to JamDB:**
* All ids must adhere to the following regex: `[\d\w\-]{3,64}` (namely, they must be between 3 and 64 characters).
* Users are specified in the form `{type}-{organization}-{id}` (e.g. `user-github-terroni`).

### Current JamDB Development Setup

Currently the calls from `this.store` are assuming the following:
* There exists a namespace called `Preprints` with `"* READ"` permissions.
* Within `Preprints` there exists two collections: `preprints` and `taxonomies` (these names must be formatted exactly this way).
* Within `Preprints.taxonomies` there exists two documents: `top3levels` and `topLevel`, both of which are provided as .json files in the `jam` directory.
* Within `Preprints.preprints`, there exists any number of preprint documents, an example of which is provided in the `jam` directory.

Here are a couple example commands for how to add these documents:
```
cd jam
cat top3levels.json | jam create Preprints taxonomies top3levels
cat dummy_preprint.json | jam create Preprints preprints test1
```
Note that `test1` is arbitrary and will be replaced by the preprint's guid in the future.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* [jamdb](https://github.com/CenterForOpenScience/jamdb)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

