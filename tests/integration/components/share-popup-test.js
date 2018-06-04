import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('share-popup', 'Integration | Component | share popup', {
    integration: true,
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Tests that the share popup has the correct inner text
    // Cannot find any instances of this being used on the site

    this.render(hbs`{{share-popup}}`);

    assert.equal(this.$().text().trim(), 'Share');

    assert.ok(this.$('#share-popover').length);
    assert.equal(this.$('#share-popover').attr('data-content'), '<div><a><i aria-hidden="true" class="fa fa-twitter-square"></i>Tweet</a><br><a><i aria-hidden="true" class="fa fa-facebook-square"></i>Post to Facebook</a><br><a><i aria-hidden="true" class="fa fa-linkedin-square"></i>Share on LinkedIn</a><br><a><i aria-hidden="true" class="fa fa-envelope-square"></i>Send in email</a><br></div>');
});
