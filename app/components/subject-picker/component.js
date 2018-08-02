import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { sort, notEmpty } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

import $ from 'jquery';
import { task } from 'ember-concurrency';

import Analytics from 'ember-osf/mixins/analytics';


function arrayEquals(arr1, arr2) {
    return arr1.length === arr2.length
        && arr1.reduce((acc, val, i) => acc && val === arr2[i], true);
}

function arrayStartsWith(arr, prefix) {
    return prefix.reduce((acc, val, i) => acc && val
        && arr[i] && val.id === arr[i].id, true);
}

const Column = EmberObject.extend({
    filterText: '',
    selection: null,
    subjectsSorted: sort('subjectsFiltered', 'sortDefinition'),
    subjectsFiltered: computed('subjects.[]', 'filterText', function() {
        const filterTextLowerCase = this.get('filterText').toLowerCase();
        const subjects = this.get('subjects');

        if (!filterTextLowerCase) {
            return subjects;
        }

        return subjects.filter(item => item.get('text').toLowerCase().includes(filterTextLowerCase));
    }),
    init() {
        this._super(...arguments);
        this.set('sortDefinition', ['text:asc']);
        this.set('subjects', []);
    },
});

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Add discipline when creating a preprint.
 *
 * Sample usage:
 * ```handlebars
 * {{subject-picker
 *      editMode=editMode
 *      initialSubjects=subjectsList
 *      currentSubjects=subjectsListReflected
 *      saveSubjects=(action 'setSubjects')
 *      provider=provider
 *}}
 * ```
 * @class subject-picker
 */
export default Component.extend(Analytics, {
    store: service(),
    theme: service(),

    init() {
        this._super(...arguments);

        this.set(
            'columns',
            A(new Array(3).fill(null).map(() => Column.create())),
        );

        this.get('loadSubjects').perform();
    },

    didReceiveAttrs() {
        if (this.get('provider') !== this.get('lastProvider')) {
            this.get('loadSubjects').perform();
            this.set('lastProvider', this.get('provider'));
        }
    },

    actions: {
        deselect(index) {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Remove`,
            });

            const allSelections = this.get('currentSubjects');

            this.resetColumnSelections();

            allSelections.removeAt(index);
        },
        discard() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Discipline Changes`,
                });

            this.resetColumnSelections();

            this.set('currentSubjects', $.extend(true, [], this.get('initialSubjects')));
        },
        save() {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Save and Continue`,
            });

            this.saveSubjects();
            this.resetColumnSelections();
        },
    },

    select: task(function* (selected, tier) {
        this.get('metrics').trackEvent({
            category: 'button',
            action: 'click',
            label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Add`,
        });

        const columns = this.get('columns');
        const column = columns.objectAt(tier);

        // Bail out if the subject is already selected
        if (column.get('selection') === selected) {
            return;
        }

        column.set('selection', selected);

        const totalColumns = columns.length;
        const nextTier = tier + 1;
        const allSelections = this.get('currentSubjects');

        const currentSelection = columns
            .slice(0, nextTier)
            .map(column => column.get('selection'));

        // An existing tag has this prefix, and this is the lowest level of the taxonomy,
        // so no need to fetch child results
        if (nextTier === totalColumns
            || !allSelections.some(item => arrayStartsWith(item, currentSelection))) {
            let existingParent;

            for (let i = 1; i <= currentSelection.length; i++) {
                const sub = currentSelection.slice(0, i);
                existingParent = allSelections
                    .find(item => arrayEquals(item, sub));

                // The parent exists, append the subject to it
                if (existingParent) {
                    existingParent.pushObjects(currentSelection.slice(i));
                    break;
                }
            }

            if (!existingParent) {
                allSelections.pushObject(currentSelection);
            }
        }

        // Bail out if we're at the last column.
        if (nextTier === totalColumns) {
            return;
        }

        for (let i = nextTier; i < totalColumns; i++) {
            columns.objectAt(i).set('subjects', null);
        }

        // TODO: Fires a network request every time clicking here, instead of only when needed?
        const results = yield this.get('getProviderTaxonomy').perform(selected.id, nextTier);
        columns.objectAt(nextTier).set('subjects', results ? results.toArray() : []);
    }),

    loadSubjects: task(function* () {
        const column = this.get('columns').objectAt(0);
        const results = yield this.get('getProviderTaxonomy').perform();

        column.set('subjects', results ? results.toArray() : []);
    }),

    getProviderTaxonomy: task(function* (parents = 'null') {
        const taxonomy = yield this.get('provider').queryHasMany('taxonomies', {
            filter: {
                parents,
            },
            page: {
                size: 150, // Law category has 117 (Jan 2018)
            },
        });

        return taxonomy;
    }),

    resetColumnSelections() {
        const columns = this.get('columns');

        columns.objectAt(0).set('selection', null);

        for (let i = 1; i < columns.length; i++) {
            const column = columns.objectAt(i);

            column.set('subjects', null);
            column.set('selection', null);
        }
    },

});
