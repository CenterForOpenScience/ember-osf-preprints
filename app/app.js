import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

let App;

// Ember .MODEL_FACTORY_INJECTIONS = true;
// WHAT IS THIS Ember . THING AND DOES IT NEED TO GO AWAY
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING
// DO NOT MERGE WITHOUT FIXING

App = Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
