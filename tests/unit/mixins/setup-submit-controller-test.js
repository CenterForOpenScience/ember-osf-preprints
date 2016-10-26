import Ember from 'ember';
import SetupSubmitControllerMixin from 'preprint-service/mixins/setup-submit-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | setup submit controller');

// Replace this with your real tests.
test('it works', function(assert) {
  let SetupSubmitControllerObject = Ember.Object.extend(SetupSubmitControllerMixin);
  let subject = SetupSubmitControllerObject.create();
  assert.ok(subject);
});
