import Ember from 'ember';
import config from 'ember-get-config';

var getProvidersPayload = '{"size": 0,"query": {"term": {"@type": "preprint"}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

var filterMap = {
    providers: 'sources',
    subjects: 'tags.raw'
};

export default Ember.Controller.extend({
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: ['page', 'searchString', 'subjectFilter'],
    activeFilters: { providers: ['OSF Providers'], subjects: [] },

    page: 1,
    size: 10,
    numberOfResults: 0,
    searchString: '',
    subjectFilter: null,
    queryBody: {},

    sortByOptions: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],

    treeSubjects: Ember.computed('activeFilters', function() {
        return this.get('activeFilters.subjects').slice();
    }),
    // chosenOption is always the first element in the list
    chosenSortByOption: Ember.computed('sortByOptions', function() {
        return this.get('sortByOptions')[0];
    }),

    showActiveFilters: true, //should always have a provider, don't want to mix osfProviders and non-osf
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

    subjectFilterPassed: Ember.computed('subjectFilter', function() {
        let filter = this.get('subjectFilter');
        if (filter !== null && filter !== '') {
            this.set('activeFilters.subjects', [filter]);
        }
        this.loadPage.call(this);
    }),
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
        let facetFilters = this.get('activeFilters');
        let filters = {};
        for (let k of Object.keys(facetFilters)) {
            let key = filterMap[k];
            if (key && facetFilters[k].length) {
                filters[key] = facetFilters[k];
            }
        }
        if (filters.sources.indexOf('OSF Providers') !== -1) {
            filters.sources = this.get('osfProviders').slice();
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

    expandedOSFProviders: false,
    osfProvider: Ember.computed('activeFilters', function() {
        this.loadPage.call(this);
        let osfProviders = ['OSF Providers', 'Open Science Framework', 'SocArxiv', 'Engrxiv'];
        let match = this.get('activeFilters.providers').filter(each => osfProviders.indexOf(each) !== -1).length > 0;
        if (!match) {
            this.set('activeFilters.subjects', []);
        }
        return match;
    }),
    otherProviders: [],
    osfProviders: ['Open Science Framework', 'SocArxiv', 'Engrxiv'],
    actions: {
        search(val, event) {
            if (event && event.keyCode < 49 && !(event.keyCode === 8 || event.keyCode === 32)) {
                return;
            }
            this.set('searchString', this.get('searchValue'));
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
            this.transitionToRoute('submit');
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
            let match = this.get('activeFilters.subjects').filter(function(item) {
                return item.indexOf(subject.text) !== -1;
            });
            this.notifyPropertyChange('activeFilters');
            if (!match.length) {
                this.get('activeFilters.subjects').pushObject(subject.text);
            } else {
                this.get('activeFilters.subjects').removeObject(subject.text);
            }
        },

        selectProvider(provider) {
            this.set('activeFilters.providers', [provider]);
            this.notifyPropertyChange('activeFilters');
        },
        expandOSFProviders() {
            this.set('expandedOSFProviders', !this.get('expandedOSFProviders'));
        }
    },
});
