import { moduleFor, test } from 'ember-qunit';
import config from '../../../config/environment';

moduleFor('service:theme', 'Unit | Service | theme', {
    // Specify the other units that are required for this test.
    needs: [
        'service:session',
        'service:head-tags',
    ],
});

// Replace this with your real tests.
test('it exists', function(assert) {
    const service = this.subject();
    assert.ok(service);
});

test('themes have proper config', function(assert) {
    const { defaultProvider } = config.PREPRINTS;
    assert.equal(defaultProvider, 'osf');
});
