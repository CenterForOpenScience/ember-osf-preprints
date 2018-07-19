import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-typeahead', 'Integration | Component | search facet typeahead', {
    integration: true,
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('key', 'contributors');
    this.set('options', {
        key: 'contributors',
        title: 'People',
        component: 'search-facet-typeahead',
        type: 'person',
    });
    this.set('state', '');
    this.set('filter', '');
    this.set('onChange', () => {});

    this.render(hbs`{{search-facet-typeahead
        key=key
        options=options
        state=state
        filter=filter
        onChange=(action onChange)

    }}`);

    assert.equal(document.getElementsByClassName('ember-power-select-trigger-multiple-input')[0].placeholder, 'Add People filter');
});
