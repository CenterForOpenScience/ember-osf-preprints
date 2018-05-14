import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('convert-or-copy-project', 'Integration | Component | convert or copy project', {
    integration: true,
    beforeEach() {
        const noop = () => {};
        this.set('noop', noop);
    },
});

test('it renders', function(assert) {
    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
    }}`);

    assert.equal(this.$('#convertExistingOrCreateComponent label').first().text().trim(), 'Make a new component');
});

test('choosing copy changes mode to copy', function(assert) {
    this.set('convertOrCopy', null);

    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        convertOrCopy=convertOrCopy
    }}`);

    this.$('#copy').click();

    assert.equal(this.get('convertOrCopy'), 'copy');
});

test('choosing copy makes the preprint title null and requires a title change', function(assert) {
    this.set('title', 'Como nossos pais');
    this.set('titleValid', true);

    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        title=title titleValid=titleValid
    }}`);

    this.$('#copy').click();

    assert.ok(!this.get('titleValid'));
    assert.equal(this.get('title'), null);
});

test('choosing convert displays converting options and changes mode to convert', function(assert) {
    this.set('convertOrCopy', null);

    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        convertOrCopy=convertOrCopy
    }}`);

    assert.equal(this.get('convertOrCopy'), null);
    assert.ok(!this.$('.exclamation-confirm-convert').length);

    this.$('#convert').click();

    assert.equal(this.get('convertOrCopy'), 'convert');
    assert.ok(this.$('.exclamation-confirm-convert').length);
});

test('choosing convert makes the preprint title the title of the node about to be converted and does not require change', function(assert) {
    this.set('title', null);
    this.set('titleValid', null);
    this.set('node', {
        title: 'Mas, que Nada!',
    });

    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        node=node title=title titleValid=titleValid
    }}`);

    this.$('#convert').click();

    assert.ok(this.get('titleValid'));
    assert.equal(this.get('title'), 'Mas, que Nada!');
});

test('can confirm conversion and passes the convertProjectConfirmed flag up', function(assert) {
    this.set('convertProjectConfirmed', false);

    this.render(hbs`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        convertProjectConfirmed=convertProjectConfirmed
    }}`);

    this.$('#convert').click();
    this.$('.btn-success').click();

    assert.ok(this.get('convertProjectConfirmed'));
});
