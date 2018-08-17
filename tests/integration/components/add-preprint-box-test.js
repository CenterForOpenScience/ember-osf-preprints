import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import Service from '@ember/service';

const fakeProvider = {
    reviewsWorkflow: 'pre-moderation',
    id: 'pandaXriv',
    name: 'The Panda Archive of bamboo',
    isProvider: true,
};

// Stub theme service
const themeStub = Service.extend({
    provider: fakeProvider,
    signupUrl: 'fakeUrl',
    redirectUrl: 'fakeUrl',
    pathPrefix: 'fakePrefix',
    id: 'pandaXriv',
});

moduleForComponent('add-preprint-box', 'Integration | Component | add preprint box', {
    integration: true,
    beforeEach() {
        this.register('service:theme', themeStub);
    },
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.inject.service('store');
    run(() => {
        const provider = this.store.createRecord('preprint-provider', {
            documentType: {
                singular: 'faker',
            },
        });
        this.set('provider', provider);
        this.render(hbs`{{add-preprint-box}}`);
        assert.strictEqual(this.$('p')[0].textContent, 'Do you want to add your own research as a ?'); // preprint words needs to be run with ember osf
    });
});
