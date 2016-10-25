import { moduleFor, test } from 'ember-qunit';

moduleFor('route:provider/submit', 'Unit | Route | provider/submit', {
  // Specify the other units that are required for this test.
    needs: [
        'controller:submit',
        'route:submit',
        'service:metrics',
        'service:theme'
    ]
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
