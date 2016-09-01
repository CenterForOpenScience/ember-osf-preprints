import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-result', 'Integration | Component | search result', {
    integration: true
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    let result = {
        providers: []
    };
    this.set('result', result);
    this.render(hbs`{{search-result result=result}}`);

    assert.equal(this.$().text().trim(), '');

});
