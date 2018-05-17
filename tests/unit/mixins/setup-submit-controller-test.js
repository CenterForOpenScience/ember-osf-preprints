import Route from '@ember/routing/route';
import SetupSubmitControllerMixin from 'preprint-service/mixins/setup-submit-controller';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:setup-submit-controller', {
    needs: [
        'service:theme',
        'service:panelActions',
        'service:session',
        'service:head-tags',
        'service:i18n',
    ],
});

test('Setup-submit-controller mixin', function(assert) {
    const routeObject = Route.extend(SetupSubmitControllerMixin);
    this.registry.register('test:subject', routeObject);
    const routeTest = this.container.lookup('test:subject');
    assert.ok(SetupSubmitControllerMixin.detect(routeTest));
    assert.ok(routeTest.get('setupSubmitController'));
    assert.ok(routeTest.get('theme'));
    assert.ok(routeTest.get('panelActions'));
});
