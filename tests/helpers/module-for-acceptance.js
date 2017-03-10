import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { manualSetup } from 'ember-data-factory-guy';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
        this.application = startApp();
        manualSetup(this.application.__container__);

        if (options.beforeEach) {
            return options.beforeEach.apply(this, arguments);
        }
    },
    afterEach() {
        // FakeServer.stop();
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}
