import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-worktype-hierarchy', 'Integration | Component | search facet worktype hierarchy', {
    integration: true,
});

test('it renders', function(assert) {
    this.set('state', ['Publication']);
    this.set('filter', '');
    this.set('data', { presentation: {} });
    this.set('onClick', () => {});

    this.render(hbs`{{search-facet-worktype-hierarchy
        key=key
        state=state
        filter=filter
        data=data
        onClick=(action onClick)
    }}`);

    assert.equal(this.$()[0].innerText.trim(), 'Presentation');
});
