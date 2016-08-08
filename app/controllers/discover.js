import Ember from 'ember';

export default Ember.Controller.extend({
    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: ['page', 'searchString'],

    page: 1,
    size: 10,
    numberOfResults: 0,
    searchString: '',

    showPrev: false,
    showNext: true,

    results: Ember.ArrayProxy.create({content: []}),

    searchUrl: 'https://staging-share.osf.io/api/search/abstractcreativework/_search',

    init() {
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());
        this.loadPage();
    },

    loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());
//        this.set('loading', true);
        return Ember.$.ajax({
            'url': this.get('searchUrl'),
            'crossDomain': true,
            'type': 'POST',
            'contentType': 'application/json',
            'data': queryBody
        }).then((json) => {
            this.set('numberOfResults', json.hits.total);
//            this.set('took', moment.duration(json.took).asSeconds());
            let results = json.hits.hits.map((hit) => {
                // HACK
                let source = hit._source;
                source.id = hit._id;
                source.type = 'elastic-search-result';
                source.workType = source['@type'];
                source.contributors = source.contributors.map(contributor => {
                    return {
                        familyName: contributor.family_name,
                        givenName: contributor.given_name,
                        id: contributor['@id']
                    };
                });
                return source;
            });
            Ember.run(() => {
                this.set('loading', false);
                this.set('results', results);

                this.togglePagination();
            });
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
            'query_string' : {
                'query': this.get('searchString') || '*'
            }
        };
        if (filters.length) {
            query = {
                'bool': {
                    'must': query,
                    'filter': filters
                }
            };
        }

        let sort = [];
        let sortBy = this.get('sortBy') || 'Relevance';
        if ( sortBy === 'Upload date (oldest to newest)' ) {
            sort.push({
                "date_updated": {"order": "asc"}
            });
        } else if ( sortBy === 'Upload date (newest to oldest)' ) {
            sort.push({
                "date_updated": {"order": "desc"}
            });
        }

        let queryBody = {
            query,
            from: (this.get('page') - 1) * this.get('size'),
            sort
        };

        return this.set('queryBody', queryBody);
    },

    togglePagination() {
        // prev
        if (this.get('page') > 1) {
            this.set('showPrev', true);
        } else {
            this.set('showPrev', false);
        }
        // next
        if (this.get('page') * this.get('size') <= this.get('numberOfResults')) {
            this.set('showNext', true);
        } else {
            this.set('showNext', false);
        }
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
            this.transitionToRoute('/preprints/add');
        }
    },

});
