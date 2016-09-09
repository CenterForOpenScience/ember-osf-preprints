import Ember from 'ember';
import AnalyticsMixinMixin from 'preprint-service/mixins/analytics-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | analytics mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let AnalyticsMixinObject = Ember.Object.extend(AnalyticsMixinMixin);
  let subject = AnalyticsMixinObject.create();
  assert.ok(subject);
});
