import Ember from 'ember';
import Analytics from '../mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays top level disciplines for preprints index page. Retrieve four children subjects per each top level
 * discipline and display as a tooltip.
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
    getSubjectChildren(parents, provider) {
        return provider.query('taxonomies', {
                    filter: {
                        parents
                    },
                    page: {
                        size: 4
                    }
                })
            .then(results =>
                results.map(result => result.get('text'))
            )
            .then(results =>
                results.toArray().sort().join(', ')
            );
    },
    getAllChildren(sortedList, i, provider) {
        if (i >= 0) {
            const subjectId = sortedList.objectAt(i).get('id');
            const subjectChildren = this.getSubjectChildren(subjectId, provider);
            subjectChildren.then(result => {
                Ember.$('#' + subjectId).attr('data-hint', result); Ember.$('#' + subjectId).attr('aria-label', result);
            }).then(() => this.getAllChildren(sortedList, i - 1, provider));
        }
    },
    didInsertElement() {
        this._super(...arguments);
        const sortedList = this.get('list').sortBy('text');
        this.get('theme.provider').then(provider => this.getAllChildren(sortedList, sortedList.get('length') - 1, provider));
    },
    // jscs:enable
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
