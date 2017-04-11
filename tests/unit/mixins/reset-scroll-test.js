import Ember from 'ember';
import ResetScrollMixin from 'preprint-service/mixins/reset-scroll';
import { module, test } from 'qunit';

module('Unit | Mixin | reset scroll');

test('ResetScrollMixin mixin scrolls back to the top on every new route', function(assert) {
    const object = Ember.Object.extend(ResetScrollMixin).create();

    object.set('scrollTarget', {
        scrollTo() {
            return [...arguments];
        }
    });

    assert.ok(ResetScrollMixin.detect(object));
    assert.deepEqual(object.activate(), [0, 0]);
});
