import Ember from 'ember';
import JamModelMixin from 'preprint-service/mixins/jam-model';
import { module, test } from 'qunit';

module('Unit | Mixin | jam model');

// Replace this with your real tests.
test('it works', function(assert) {
  let JamModelObject = Ember.Object.extend(JamModelMixin);
  let subject = JamModelObject.create();
  assert.ok(subject);
});
