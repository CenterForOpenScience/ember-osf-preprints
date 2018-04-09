import {moduleForComponent, test} from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

//Stub location service
const themeStub = Service.extend({
    isProvider: true,
    provider: {
        name: 'Test'
    }
});

moduleForComponent('error-page', 'Integration | Component | error page', {
    integration: true,
    beforeEach: function () {
        this.register('service:theme', themeStub);
        // Calling inject puts the service instance in the test's context,
        // making it accessible as "locationService" within each test
        this.inject.service('theme');
    }
});

test('it renders', function (assert) {
    this.render(hbs`{{error-page label='Page not found' translateKey='page-not-found'}}`);

    assert.ok(this.$('div').length);
});
