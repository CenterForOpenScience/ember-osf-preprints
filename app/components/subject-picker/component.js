import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import $ from 'jquery';
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
    subjectsFiltered: computed('subjects.[]', 'filterText', function() {
        const filterTextLowerCase = this.get('filterText').toLowerCase();
        const subjects = this.get('subjects');

        if (!filterTextLowerCase) {
            return subjects;
        }

        return subjects !== null ? subjects.filter(item => item.get('text').toLowerCase().includes(filterTextLowerCase)) : null;
    }),
    init() {
        this._super(...arguments);
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

    isValid: notEmpty('currentSubjects'),

    init() {
        this._super(...arguments);

        const tempSubjects = A();

        this.get('initialSubjects').forEach((subject) => {
            tempSubjects.push(subject);
        });

        this.setProperties({
            initialSubjects: [],
            currentSubjects: [],
            hasChanged: false,
            columns: A(new Array(3).fill(null).map(() => Column.create())),
        });

        this.querySubjects();
        this.set('currentSubjects', tempSubjects);
    },

    didReceiveAttrs() {
        if (this.get('provider') !== this.get('lastProvider')) {
            this.querySubjects();
            this.set('lastProvider', this.get('provider'));
        }
    },

    actions: {
        deselect(index) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Remove`,
                });

            const allSelections = this.get('currentSubjects');

            this.set('hasChanged', true);
            this.resetColumnSelections();

            allSelections.removeAt(index);
        },
        select(selected, tier) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Add`,
                });

            this.set('hasChanged', true);
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
            this.querySubjects(selected.id, nextTier);
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
            this.set('hasChanged', false);
        },
        save() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Save and Continue`,
                });
            this.saveSubjects(this.get('currentSubjects'), this.get('hasChanged'));
        },
    },
    querySubjects(parents = 'null', tier = 0) {
        const column = this.get('columns').objectAt(tier);

        if (this.get('provider')) {
            this.get('provider').queryHasMany('taxonomies', {
                filter: {
                    parents,
                },
                page: {
                    size: 150, // Law category has 117 (Jan 2018)
                },
            })
                .then(results => column.set('subjects', results ? results.toArray() : []));
        }
    },

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
