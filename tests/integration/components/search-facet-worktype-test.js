import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-worktype', 'Integration | Component | search facet worktype', {
    integration: true,
});

test('it renders', function(assert) {
    this.set('key', 'type');
    this.set('state', ['Publication']);
    this.set('filter', '');
    this.set('data', { presentation: {} });

    this.render(hbs`{{search-facet-worktype
        key=key
        state=state
        filter=filter
        data=data
    }}`);

    assert.equal(this.$('.type-filter-option')[0].innerText.trim(), 'Presentation');
});
