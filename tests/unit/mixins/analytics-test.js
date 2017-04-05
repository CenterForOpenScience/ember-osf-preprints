import Ember from 'ember';
import Analytics from 'preprint-service/mixins/analytics';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:analytics', {
    needs: [
        'service:metrics',
    ],
});

test("Google Analytics mixin", function(assert) {
    let analyticsObject = Ember.Controller.extend(Analytics);
    this.registry.register('test:subject', analyticsObject);
    const analyticsTest = this.container.lookup('test:subject');
    assert.ok(analyticsTest);
    const checkActions = (analyticsTest.get('actions.click') && analyticsTest.get('actions.track'));
    if (checkActions) {
        assert.ok(true);
    } else {
        assert.ok(false);
    }
    const checkMetrics = (analyticsTest.get('metrics'));
    if (checkMetrics) {
        assert.ok(true);
    } else {
        assert.ok(false);
    }
});
