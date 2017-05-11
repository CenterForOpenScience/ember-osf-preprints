import Ember from 'ember';
import Analytics from '../mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays top level disciplines for preprints index page
 *
 * Sample usage:
 * ```handlebars
 * {{taxonomy-top-list
 *     list=model.taxonomies
 * }}
 * ```
 * @class taxonomy-top-list
 */
export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    sortedList: Ember.computed('list', 'list.content', function() {
        if (!this.get('list')) {
            return;
        }
        const sortedList = this.get('list').sortBy('text');
        const pairedList = [];
        for (let i = 0; i < sortedList.get('length'); i += 2) {
            let pair = [];
            pair.pushObject(sortedList.objectAt(i));
            if (sortedList.objectAt(i + 1)) {
                pair.pushObject(sortedList.objectAt(i + 1));
            }
            pairedList.pushObject(pair);
        }
        return pairedList;
    })
});
