import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
        this.application = startApp();
        manualSetup(this.application.__container__);
        // FakeServer.start()
        let me = FactoryGuy.make('user');
        let provider = FactoryGuy.make('preprint-provider');
        me.set('id', 'me');
        provider.set('id', 'osf');
        // let data = provider.serialize().data;
        // data.id = 'osf';
        // //Most routes will request osf provider on startup
        // stubRequest('get', 'http://localhost:8000/v2/preprint_providers', (request) => {
        //     request.ok({data: [data]});
        // });
        // stubRequest('get', 'http://localhost:8000/v2/preprint_providers/osf', (request) => {
        //     request.ok({data: data});
        // });
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
