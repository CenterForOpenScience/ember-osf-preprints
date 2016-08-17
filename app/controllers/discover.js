import Ember from 'ember';
import config from 'ember-get-config';

var getProvidersPayload = '{"size": 0,"query": {"term": {"@type": "preprint"}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

var filterMap = {
    provider: 'sources',
    subject: 'tags.raw'
};

export default Ember.Controller.extend({
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: ['page', 'searchString'],
    activeFilters: Ember.A(['provider:OSF Providers']),

    page: 1,
    size: 10,
    numberOfResults: 0,
    searchString: '',
    queryBody: {},

    sortByOptions: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],

    // chosenOption is always the first element in the list
    chosenSortByOption: Ember.computed('sortByOptions', function() {
        return this.get('sortByOptions')[0];
    }),

    showActiveFilters: Ember.computed.notEmpty('activeFilters'),
    showPrev: Ember.computed.gt('page', 1),
    showNext: Ember.computed('page', 'size', 'numberOfResults', function() {
        return this.get('page') * this.get('size') <= this.get('numberOfResults');
    }),

    results: Ember.ArrayProxy.create({ content: [] }),

    searchUrl: config.SHARE.searchUrl,

    init() {
        var _this = this;
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());
        Ember.$.ajax({
            type: 'POST',
            url: this.get('searchUrl'),
            data: getProvidersPayload,
            contentType: 'application/json',
            crossDomain: true,
        }).then(function(results) {
            var hits = results.aggregations.sources.buckets;
            hits.map(function(each) {
                _this.get('otherProviders').pushObject(each.key);
            });
        });
        this.loadPage.call(this);
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
            if (this.isDestroyed || this.isDestroying) {
                return;
            }
            this.set('numberOfResults', json.hits.total);
            let results = json.hits.hits.map((hit) => {
                // HACK
                let source = hit._source;
                source.id = hit._id;
                source.type = 'elastic-search-result';
                source.workType = source['@type'];
                source.contributors = source.contributors.map(function(contributor) {
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
        let facetFilters = this.get('activeFilters').slice();
        facetFilters.filter(function(each) {
            if (each === 'provider:OSF Providers') {
                facetFilters.push('provider:Open Science Framework', 'provider:SocArxiv', 'provider:Engrxiv');
                return false;
            }
            return true;
        });
        let filters = {};
        for (let k of facetFilters) {
            let filter = k.split(':')[0];
            if (filterMap[filter]) {
                if (filters[filterMap[filter]]) {
                    filters[filterMap[filter]].push(k.split(':')[1]);
                } else {
                    filters[filterMap[filter]] = [k.split(':')[1]];
                }
            }
        }
        let query = {
            query_string: {
                query: this.get('searchString') || '*'
            }
        };
        //to be removed when we are actually filtering preprints
        if (Object.keys(filters).length !== 0) {
            let filters_ = [];
            for (let k of Object.keys(filters)) {
                let terms = {};
                terms[k] = filters[k];
                filters_.push({
                    terms: terms
                });
            }
            //to be added when there are actual preprints
            // filters_.push({
            //     terms: {'@type.raw': ['preprint']}
            // });
            query = {
                bool: {
                    must: query,
                    filter: filters_
                }
            };
        }
        let sort = [];
        let sortByOption = this.get('chosenSortByOption');
        if (sortByOption === 'Upload date (oldest to newest)') {
            sort.push({
                date_updated: { order: 'asc' }
            });
        } else if (sortByOption === 'Upload date (newest to oldest)') {
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

    expandedOSFProviders: false,
    treeSubjects: Ember.computed('activeFilters', function() {
        let filters = this.get('activeFilters').filter(
            each => each.indexOf('subject') !== -1
        ).map(
            each => each.split(':')[1]
        );
        return filters;
    }),
    selectedProviders: Ember.computed('activeFilters', function() {
        let filters = this.get('activeFilters').filter(
            each => each.indexOf('provider') !== -1
        ).map(
            each => each.split(':')[1]
        );
        return filters;
    }),
    osfProvider: Ember.computed('activeFilters', function() {
        this.loadPage.call(this);
        var _this = this;
        var subjectFilters = [];
        let osfProviders = ['OSF Providers', 'Open Science Framework', 'SocArxiv', 'Engrxiv'];
        let match = this.get('activeFilters').filter(function(each) {
            if (each.indexOf('subject') !== -1) {
                subjectFilters.push(each);
                return false;
            }
            return each.indexOf('provider') !== -1;
        });
        let ret = osfProviders.indexOf(match[0].replace('provider:', '')) !== -1;
        if (!ret) {
            subjectFilters.map(each => _this.get('activeFilters').removeObject(each));
        }
        return ret;
    }),
    otherProviders: [],
    osfProviders: ['Open Science Framework', 'SocArxiv', 'Engrxiv'],
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

        linkToAddPreprint() {
            this.transitionToRoute('add-preprint');
        },

        clearFilters() {
            this.set('activeFilters', []);
        },

        sortBySelect(index) {
            // Selecting an option just swaps it with whichever option is first
            let copy = this.get('sortByOptions').slice(0);
            let temp = copy[0];
            copy[0] = copy[index];
            copy[index] = temp;
            this.set('sortByOptions', copy);
            this.set('page', 1);
            this.loadPage();
        },

        selectSubjectFilter(subject) {
            let match = this.get('activeFilters').filter(function(item) {
                return item.indexOf(subject.text) !== -1;
            });
            this.notifyPropertyChange('activeFilters');
            if (!match.length) {
                this.get('activeFilters').pushObject('subject:' + subject.text);
            } else {
                this.get('activeFilters').removeObject('subject:' + subject.text);
            }
        },

        selectProvider(provider) {
            let match = this.get('activeFilters').filter(function(item) {
                return item.indexOf('provider') !== -1;
            });
            if (match.length) {
                this.get('activeFilters').removeObject(match[0]);
            }
            this.notifyPropertyChange('activeFilters');
            this.get('activeFilters').pushObject('provider:' + provider);
        },
        expandOSFProviders() {
            this.set('expandedOSFProviders', !this.get('expandedOSFProviders'));
        }
    },
});
