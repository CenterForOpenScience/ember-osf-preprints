import RSVP from 'rsvp';
import { module } from 'qunit';

<<<<<<< HEAD
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';
import config from 'ember-get-config';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
=======
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';
import config from 'ember-get-config';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
>>>>>>> 2c12d5a14817362b5bacca1c56162445060e70ca

export default function(name, options = {}) {
    module(name, {
        beforeEach() {
            this.application = startApp();
            FakeServer.start();
            manualSetup(this.application.__container__);
            const url = config.OSF.apiUrl;
            const provider = FactoryGuy.build('preprint-provider');

            stubRequest('get', `${url}/v2/users/me`, (request) => {
                request.unauthorized({});
            });
            stubRequest('get', `${url}/v2/preprint_providers`, (request) => {
                request.ok({
                    data: [{
                        attributes: provider.data.attributes,
                        type: 'preprint_providers',
                        id: 'osf',
                    }],
                });
            });
            stubRequest('get', `${url}/v2/preprint_providers/osf`, (request) => {
                request.ok({
                    data: {
                        attributes: provider.data.attributes,
                        type: 'preprint_providers',
                        id: 'osf',
                    },
                });
            });

<<<<<<< HEAD
            if (options.beforeEach) {
                return options.beforeEach.apply(this, arguments);
            }
        },
        afterEach() {
            FakeServer.stop();
            const afterEach = options.afterEach && options.afterEach.apply(this, arguments);
            return RSVP.resolve(afterEach).then(() => destroyApp(this.application));
        },
    });
=======
        if (options.beforeEach) {
            return options.beforeEach.apply(this, arguments);
        }
    },
    afterEach() {
        FakeServer.stop();
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return RSVP.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
>>>>>>> 2c12d5a14817362b5bacca1c56162445060e70ca
}
