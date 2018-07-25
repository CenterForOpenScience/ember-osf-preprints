import Ember from 'ember';
import layout from './template';

const defaultCategories = {
    Content: name => name.includes('CC'),
    'Code - Permissive': name => name.includes('MIT') || name.includes('Apache') || name.includes('BSD'),
    'Code - Copyleft': name => name.includes('GNU') && !name.includes('Lesser')
};

export default Ember.Component.extend({
    layout,
    store: Ember.inject.service(),
    selectedLicense: Ember.computed('currentLicense', 'licenses', '_selectedLicense', function() {
        if (this.get('_selectedLicense') !== null) {
            return this.get('_selectedLicense');
        }
        return this.get('currentLicense');
    }),
    categories: Ember.A(),
    categoriesSeparator: Ember.observer('licenses', function() {
        if (!this.get('showCategories') || !this.get('licenses')) {
            return;
        }
        let categories = [];
        let hasOther = false;
        let cat = {
            Content: [],
            'Code - Permissive': [],
            'Code - Copyleft': [],
            'Code - Other': []
        };
        this.get('licenses').forEach(each => {
            if (each.get('name') === 'No license') {
                categories.push({
                    licenses: [each]
                });
            } else if (each.get('name') === 'Other') {
                hasOther = {
                    licenses: [each]
                };
            } else {
                let pass = false;
                for (var key of Object.keys(defaultCategories)) {
                    if (defaultCategories[key](each.get('name'))) { //does it match the rule
                        cat[key].push(each);
                        pass = true;
                        break;
                    }
                }
                if (!pass) {
                    cat['Code - Other'].push(each);
                }

            }
        });
        for (var key of Object.keys(cat)) {
            if (cat[key].length) {
                categories.push({
                    title: key,
                    licenses: cat[key]
                });
            }
        }
        if (hasOther) {
            categories.push(hasOther);
        }
        this.set('categories', categories);
    }),
    actions: {
        select(value) {
            let license = this.get('store').peekRecord('license', value);
            this.sendAction('select', license);
        }
    }
});
