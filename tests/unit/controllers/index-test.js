import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:index', 'Unit | Controller | index', {
    // Specify the other units that are required for this test.
    needs: [
        'service:metrics',
        'service:session',
        'service:theme',
    ],
});


test('Initial properties', function (assert) {
    const ctrl = this.subject();

    const expected = {
    };

    const propKeys = Object.keys(expected);
    const actual = ctrl.getProperties(propKeys);

    assert.ok(propKeys.every(key => expected[key] === actual[key]));
});

test('it exists', function(assert) {
    const ctrl = this.subject();
    assert.ok(ctrl);
});
