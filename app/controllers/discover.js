import Ember from 'ember';

export default Ember.Controller.extend({

    page: 1,
    size: 10,
    searchString: '',

    results: Ember.ArrayProxy.create({content: []}),

    searchUrl: 'https://staging-share.osf.io/api/search/abstractcreativework/_search',

    init() {
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());
        this.loadPage();
    },

    loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());
        this.set('loading', true);
        return Ember.$.ajax({
            'url': this.get('searchUrl'),
            'crossDomain': true,
            'type': 'POST',
            'contentType': 'application/json',
            'data': queryBody
        }).then((json) => {
            this.set('numberOfResults', json.hits.total);
            this.set('took', moment.duration(json.took).asSeconds());
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
                this.get('results').addObjects(results);
                debugger;
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

        let queryBody = {
            query,
            from: (this.get('page') - 1) * this.get('size'),
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

});
