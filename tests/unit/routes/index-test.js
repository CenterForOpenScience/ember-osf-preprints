import { moduleFor, test } from 'ember-qunit';

moduleFor('route:index', 'Unit | Route | index', {
  // Specify the other units that are required for this test.
    needs: ['service:metrics', 'service:theme']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});

test('google metrics array exists', function(assert) {
    // Tests that there are google metrics tags included on the page
    let component = this.subject();
    
    component.set('googleScholarTags', [{
            users: {
            givenName: 'Tester',
            familyName: 'Test',
            fullName: 'Tester J. Test'
            }
        }
    ]);

    assert.ok(component.get('googleScholarTags').length);
});
