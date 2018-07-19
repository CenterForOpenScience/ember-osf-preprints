import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';
import config from 'ember-get-config';

import { getUniqueList } from '../../utils/elastic-query';


const RESULTS = 20;
const DEBOUNCE_MS = 250;


export default Component.extend({
    metrics: service(),
    category: 'filter-facets',

    placeholder: computed(function() {
        return `Add ${this.get('options.title')} filter`;
    }),

    selected: computed('state.value.[]', function() {
        return this.get('state.value') || [];
    }),

    actions: {
        changeFilter(selected) {
            const category = this.get('category');
            const action = 'filter';
            const label = selected;

            this.get('metrics').trackEvent({ category, action, label });
            this.get('updateFacet')(this.get('key'), getUniqueList(selected));
        },
    },

    typeaheadQueryUrl() {
        const base = this.get('options.base') || this.get('key');
        return `${config.OSF.shareApiUrl}/search/${base}/_search`;
    },

    buildTypeaheadQuery(text) {
        const match = {
            match: {
                'name.autocomplete': {
                    query: text,
                    operator: 'and',
                    fuzziness: 'AUTO',
                },
            },
        };
        const type = this.get('options.type');
        if (type) {
            return {
                size: RESULTS,
                query: {
                    bool: {
                        must: [match],
                        filter: [{ term: { types: type } }],
                    },
                },
            };
        }
        return { size: RESULTS, query: match };
    },

    searchElastic: task(function* (term) {
        if (isBlank(term)) { yield []; }
        yield timeout(DEBOUNCE_MS);

        const data = JSON.stringify(this.buildTypeaheadQuery(term));

        const response = yield $.ajax({
            url: this.typeaheadQueryUrl(),
            crossDomain: true,
            type: 'POST',
            contentType: 'application/json',
            data,
        });

        return getUniqueList(response.hits.hits.mapBy('_source.name'));
    }).restartable(),
});
