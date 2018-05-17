import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('preprint-title-editor', 'Integration | Component | preprint title editor', {
    integration: true,
});

// TODO: tests based on error messages, as isValid is not triggering properly
// cursory glance at ember-cpi-validations seem to indicate trouble with testing

test('renders valid title', function(assert) {
    this.render(hbs`{{preprint-title-editor
        title="This is a valid title"
    }}`);
    assert.ok(!this.$('.error').length);
});

test('renders no title', function(assert) {
    this.set('title', 'Valid Title');
    this.render(hbs`{{preprint-title-editor
        title=title
    }}`);

    // Need to go from actual input to no input to trigger validation
    this.set('title', '');
    assert.ok(this.$('.error').length);
});

test('renders invalid title', function(assert) {
    this.set('title', 'Title is too long'.repeat(250));
    this.render(hbs`{{preprint-title-editor
        title=title
    }}`);

    assert.ok(this.$('.error').length);
});
