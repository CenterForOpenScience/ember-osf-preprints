import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-source', 'Integration | Component | search facet source', {
    integration: true,
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('key', 'sources');
    this.set('options', { key: 'sources', title: 'Source', component: 'search-facet-source' });
    this.set('state', '');
    this.set('filter', '');
    this.set('onChange', () => {});

    this.render(hbs`{{search-facet-source
        key=key
        options=options
        state=state
        filter=filter
        onChange=(action onChange)
    }}`);

    assert.equal(document.getElementsByClassName('ember-power-select-trigger-multiple-input')[0].placeholder, 'Add Source filter');
});
