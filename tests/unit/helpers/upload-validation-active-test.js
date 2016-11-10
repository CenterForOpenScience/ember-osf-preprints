
import { uploadValidationActive } from 'preprint-service/helpers/upload-validation-active';
import { module, test } from 'qunit';

module('Unit | Helper | upload validation active');

// Replace this with your real tests.
test('it works', function(assert) {
    var editMode = true;
    var nodeLocked = true;
    var hasOpened = true;
    let result = uploadValidationActive([editMode, nodeLocked, hasOpened]);
    assert.ok(result);
});
