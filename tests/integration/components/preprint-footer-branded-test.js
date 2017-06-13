import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-footer-branded', 'Integration | Component | preprint footer branded', {
  integration: true
});

test('shows all social', function(assert) {
    this.set('model', {
        footerLinks: '<i class="fa fa-2x fa-twitter"></i><i class="fa fa-2x fa-instagram"></i><i class="fa fa-2x fa-facebook"></i>'
    });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.equal(this.$('.fa-twitter').length, 1);
    assert.equal(this.$('.fa-facebook').length, 1);
    assert.equal(this.$('.fa-instagram').length, 1);
});
