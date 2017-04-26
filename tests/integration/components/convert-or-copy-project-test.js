import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('convert-or-copy-project', 'Integration | Component | convert or copy project', {
    integration: true,
    beforeEach: function() {
        let noop = () => {};
        this.set('noop', noop);
    }
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{convert-or-copy-project
        clearDownstreamFields=(action noop)
        nextUploadSection=(action noop)
        ${componentArgs || ''}
    }}`));
}

test('it renders', function(assert) {
    render(this);
    assert.equal(this.$('#convertExistingOrCreateComponent label').first().text().trim(), 'Make a new component');
});

test('choosing copy changes mode to copy', function(assert){
    this.set('convertOrCopy', null);

    render(this, 'convertOrCopy=convertOrCopy');
    this.$('#copy').click();

    assert.equal(this.get('convertOrCopy'), 'copy');
});

test('choosing copy makes nodeTitle null and requires a title change', function(assert){
    this.set('nodeTitle', 'Como nossos pais');
    this.set('titleValid', true);

    render(this, 'nodeTitle=nodeTitle titleValid=titleValid');
    this.$('#copy').click();

    assert.ok(!this.get('titleValid'));
    assert.equal(this.get('nodeTitle'), null);
});

test('choosing convert displays converting options and changes mode to convert', function(assert){
    this.set('convertOrCopy', null);

    render(this, 'convertOrCopy=convertOrCopy');

    assert.equal(this.get('convertOrCopy'), null);
    assert.ok(!this.$('.exclamation-confirm-convert').length);

    this.$('#convert').click();

    assert.equal(this.get('convertOrCopy'), 'convert');
    assert.ok(this.$('.exclamation-confirm-convert').length);
});

test('choosing convert makes nodeTitle the title of the node about to be converted and does not require change', function(assert){
    this.set('nodeTitle', null);
    this.set('titleValid', null);
    this.set('node', {
        title: 'Mas, que Nada!'
    });

    render(this, 'node=node nodeTitle=nodeTitle titleValid=titleValid');
    this.$('#convert').click();

    assert.ok(this.get('titleValid'));
    assert.equal(this.get('nodeTitle'), 'Mas, que Nada!');
});

test('can confirm conversion and passes the convertProjectConfirmed flag up', function(assert){
    this.set('convertProjectConfirmed', false);

    render(this, 'convertProjectConfirmed=convertProjectConfirmed');
    this.$('#convert').click();
    this.$('.btn-success').click();

    assert.ok(this.get('convertProjectConfirmed'));
});
