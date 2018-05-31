import { moduleFor, test } from 'ember-qunit';
import EmberService from '@ember/service';
import { merge } from '@ember/polyfills';
import tHelper from 'ember-i18n/helper';

// Stub i18n service
const i18nStub = EmberService.extend({
    _globals: {},
    t(key) {
        const translated = {
            'documentType.preprint.singularCapitalized': 'Preprint',
        };
        return translated[key];
    },
    addGlobals(globals) {
        this.set('_globals', merge(this.get('_globals'), globals));
    },
});

moduleFor('controller:application', 'Unit | Controller | application', {
    needs: [
        'service:metrics',
        'service:toast',
        'service:theme',
        'service:session',
        'service:preprintWord',
    ],
    beforeEach() {
        this.registry.register('helper:t', tHelper);
        this.register('service:i18n', i18nStub);
    },
});

test('controller application it exists', function (assert) {
    const controller = this.subject();
    assert.ok(controller);
    assert.strictEqual(controller.get('i18n').t('documentType.preprint.singularCapitalized'), 'Preprint');
});
