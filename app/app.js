import Application from '@ember/application';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import Resolver from './resolver';

const App = Application.extend({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
