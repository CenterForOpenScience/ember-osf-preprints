import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-worktype-button', 'Integration | Component | search facet worktype button', {
    integration: true,
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('type', 'preprint');
    this.set('label', 'Preprint');
    this.set('selectedTypes', '');
    this.set('onClick', () => {});

    this.render(hbs`{{search-facet-worktype-button
        type=type
        label=label
        selectedTypes=selectedTypes
        onClick=(action onClick)
    }}`);

    assert.equal(this.$().text().trim(), 'Preprint');
});
