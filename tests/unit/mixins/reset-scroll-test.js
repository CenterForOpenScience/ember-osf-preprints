import Ember from 'ember';
import ResetScrollMixin from 'preprint-service/mixins/reset-scroll';
import { module, test } from 'qunit';

module('Unit | Mixin | reset scroll');

test('ResetScrollMixin mixin scrolls back to the top on every new route', function(assert) {
    let routeObject = Ember.Route.extend(ResetScrollMixin);
    let routeTest = routeObject.create();
    assert.equal(ResetScrollMixin.detect(routeTest), true);
    assert.equal(routeTest.get('scrollTopValue'), null);
    routeTest.activate();
    assert.equal(routeTest.get('scrollTopValue'), 0);
});
