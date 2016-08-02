import Ember from 'ember';
import PreprintFormFieldMixin from 'preprint-service/mixins/preprint-form-field';
import { module, test } from 'qunit';

module('Unit | Mixin | preprint form field');

// Replace this with your real tests.
test('it works', function(assert) {
  let PreprintFormFieldObject = Ember.Object.extend(PreprintFormFieldMixin, {
      verify() {}
  });
  let subject = PreprintFormFieldObject.create();
  assert.ok(subject);
});
