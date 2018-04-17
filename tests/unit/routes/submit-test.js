import { moduleFor, test } from 'ember-qunit';

moduleFor('route:submit', 'Unit | Route | submit', {
  // Specify the other units that are required for this test.
  needs: [
      'service:metrics',
      'service:theme',
      'service:session',
      'service:panelActions',
      'service:i18n',
      'service:currentUser'
  ]
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
