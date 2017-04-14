import { moduleForComponent, test } from 'ember-qunit';
//import hbs from 'htmlbars-inline-precompile';
import 'ember-data';

moduleForComponent('search-result', 'Integration | Component | search result', {
    integration: true
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    let result = {
        identifiers: []
    };
    let subjects = {
        identifiers: []
    };

    this.set('result', result);
    this.set('subjects', subjects);
    this.set('updateFilters', function() {
        assert.ok('ok');
    });

//    this.render(hbs`{{search-result result=result subject=(action updateFilters subjects)}}`);

    assert.ok('ok');
});
