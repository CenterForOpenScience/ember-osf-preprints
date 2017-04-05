import Ember from 'ember';
import SetupSubmitControllerMixin from 'preprint-service/mixins/setup-submit-controller';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:setup-submit-controller', {
    needs: [
        'service:theme',
        'service:panelActions',
        'service:session',
    ],
});

test('Setup-submit-controller mixin', function(assert) {
    let routeObject = Ember.Route.extend(SetupSubmitControllerMixin);
    this.registry.register('test:subject', routeObject);
    const routeTest = this.container.lookup('test:subject');
    assert.equal(SetupSubmitControllerMixin.detect(routeTest), true);
    const checkSetupController = (routeTest.get('setupSubmitController'));
    if (checkSetupController) {
        assert.ok(true);
    } else {
        assert.ok(false);
    }
    const checkServices = (routeTest.get('theme') && (routeTest.get('panelActions')));
    if (checkServices) {
        assert.ok(true);
    } else {
        assert.ok(false);
    }
});
