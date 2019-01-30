
import { uploadValidationActive } from 'preprint-service/helpers/upload-validation-active';
import { module, test } from 'qunit';

module('Unit | Helper | upload validation active');

test('edit mode upload validation active', function(assert) {
    const editMode = true;
    const preprintLocked = true;
    const hasOpened = true;
    const result = uploadValidationActive([editMode, preprintLocked, hasOpened]);
    assert.equal(result, true);
});

test('edit mode upload validation not active', function(assert) {
    const editMode = true;
    const preprintLocked = false;
    const hasOpened = true;
    const result = uploadValidationActive([editMode, preprintLocked, hasOpened]);
    assert.equal(result, false);
});

test('add mode upload validation active', function(assert) {
    const editMode = false;
    const preprintLocked = true;
    const hasOpened = true;
    const result = uploadValidationActive([editMode, preprintLocked, hasOpened]);
    assert.equal(result, true);
});


test('add mode upload validation not active', function(assert) {
    const editMode = false;
    const preprintLocked = false;
    const hasOpened = true;
    const result = uploadValidationActive([editMode, preprintLocked, hasOpened]);
    assert.equal(result, false);
});
