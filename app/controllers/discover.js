import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Controller.extend({
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: ['page', 'searchString'],
    activeFilters: ['Biology and life sciences'],

    page: 1,
    size: 10,
    numberOfResults: 0,
    searchString: '',

    showActiveFilters: Ember.computed.notEmpty('activeFilters'),
    showPrev: Ember.computed.gt('page', 1),
    showNext: Ember.computed('page', 'size', 'numberOfResults', function() {
        return this.get('page') * this.get('size') <= this.get('numberOfResults');
    }),

    results: Ember.ArrayProxy.create( {content: []} ),

    searchUrl: config.SHARE.searchUrl,

    init() {
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());
        this.loadPage();
    },

    loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());
        this.set('loading', true);
        return Ember.$.ajax({
            url: this.get('searchUrl'),
            crossDomain: true,
            type: 'POST',
            contentType: 'application/json',
            data: queryBody
        }).then((json) => {
            this.set('numberOfResults', json.hits.total);
            let results = json.hits.hits.map((hit) => {
                // HACK
                let source = hit._source;
                source.id = hit._id;
                source.type = 'elastic-search-result';
                source.workType = source['@type'];
                source.contributors = source.contributors.map((contributor) => {
                    return {
                        familyName: contributor.family_name,
                        givenName: contributor.given_name,
                        id: contributor['@id']
                    };
                });
                return source;
            });
            this.set('loading', false);
            this.set('results', results);
        });
    },

    getQueryBody() {
        let facetFilters = this.get('facetFilters');
        let filters = [];
        for (let k of Object.keys(facetFilters)) {
            let filter = facetFilters[k];
            if (filter) {
                if (Ember.$.isArray(filter)) {
                    filters = filters.concat(filter);
                } else {
                    filters.push(filter);
                }
            }
        }

        let query = {
            query_string: {
                query: this.get('searchString') || '*'
            }
        };
        if (filters.length) {
            query = {
                bool: {
                    must: query,
                    filter: filters
                }
            };
        }

        let sort = [];
        let sortBy = this.get('sortBy') || 'Relevance';
        if (sortBy === 'Upload date (oldest to newest)') {
            sort.push({
                date_updated: { order: 'asc' }
            });
        } else if (sortBy === 'Upload date (newest to oldest)') {
            sort.push({
                date_updated: { order: 'desc' }
            });
        }

        let queryBody = {
            query,
            from: (this.get('page') - 1) * this.get('size'),
            sort
        };

        return this.set('queryBody', queryBody);
    },

    termsFilter(field, terms, raw = true) {
        if (terms && terms.length) {
            if (raw) {
                field = field + '.raw';
            }
            let filter = { terms: {} };
            filter.terms[field] = terms;
            return filter;
        } else {
            return null;
        }
    },

    actions: {
        search(query) {
            this.set('searchString', query);
            this.set('page', 1);
            this.loadPage();
        },

        previous() {
            if (this.get('page') > 1) {
                this.decrementProperty('page');
                this.loadPage();
            }
        },

        next() {
            if (this.get('page') * this.get('size') <= this.get('numberOfResults')) {
                this.incrementProperty('page');
                this.loadPage();
            }
        },

        sortBy(option) {
            this.set('sortBy', option);
            this.set('page', 1);
            this.loadPage();
        },

        linkToAddPreprint() {
            this.transitionToRoute('add-preprint');
        },

        clearFilters() {
            this.set('activeFilters', []);
        }
    },

});
