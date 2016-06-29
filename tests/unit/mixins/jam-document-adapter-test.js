import Ember from 'ember';
import JamDocumentAdapterMixin from 'preprint-service/mixins/jam-document-adapter';
import { module, test } from 'qunit';

module('Unit | Mixin | jam document adapter');

// Replace this with your real tests.
test('it works', function(assert) {
  let JamDocumentAdapterObject = Ember.Object.extend(JamDocumentAdapterMixin);
  let subject = JamDocumentAdapterObject.create();
  assert.ok(subject);
});
