import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';

import { elasticEscape } from '../utils/elastic-query';

var getProvidersPayload = '{"from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"types": "preprint"}}]}},"aggregations": {"sources": {"terms": {"field": "sources","size": 200}}}}';

const filterMap = {
    providers: 'sources',
    subjects: 'subjects'
};

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Discover Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(), // jshint ignore:line
    // TODO: either remove or add functionality to info icon on "Refine your search panel"

    // Many pieces taken from: https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js
    queryParams: {
        page: 'page',
        queryString: 'q',
        subjectFilter: 'subject',
        providerFilter: 'provider',
    },

    activeFilters: { providers: [], subjects: [] },

    osfProviders: [],

    whiteListedProviders: [
        'arXiv',
        'bioRxiv',
        'Cogprints',
        'PeerJ',
        'Research Papers in Economics'
    ].map(item => item.toLowerCase()),

    page: 1,
    size: 10,
    numberOfResults: 0,
    queryString: '',
    subjectFilter: null,
    queryBody: {},
    providersPassed: false,

    i18n: Ember.inject.service(),

    sortByOptions: Ember.computed('i18n.locale', function() {
        const i18n = this.get('i18n');
        return [i18n.t('discover.relevance'), i18n.t('discover.sort_oldest_newest'), i18n.t('discover.sort_newest_oldest')];
    }),

    pageNumbers: [],
    sortByOption: '',

    treeSubjects: Ember.computed('activeFilters', function() {
        return this.get('activeFilters.subjects').slice();
    }),
    // chosenSortByOption is going to be the last selected element, or if it's a new page then it's the first in the list
    chosenSortByOption: Ember.computed('sortByOption', function() {
        return this.get('sortByOption') || this.get('sortByOptions')[0];
    }),

    showActiveFilters: true, //should always have a provider, don't want to mix osfProviders and non-osf
    showPrev: Ember.computed.gt('page', 1),
    showNext: Ember.computed('page', 'size', 'numberOfResults', function() {
        return this.get('page') * this.get('size') < this.get('numberOfResults');
    }),

    results: Ember.ArrayProxy.create({ content: [] }),

    searchUrl: config.SHARE.searchUrl,

    init() {
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());

        Promise.all([
            // The providers list from the API
            this.store
                .findAll('preprint-provider')
                .then(providers => {
                    const providerNames = providers.map(provider => {
                        const name = provider.get('name');
                        // TODO Change this in populate_preprint_providers script to just OSF
                        return name === 'Open Science Framework' ? 'OSF' : name;
                    });
                    this.set('osfProviders', providerNames);

                    return providerNames;
                }),
            // The providers list from SHARE
            Ember.$
                .ajax({
                    type: 'POST',
                    url: this.get('searchUrl'),
                    data: getProvidersPayload,
                    contentType: 'application/json',
                    crossDomain: true,
                })
                .then(results => results.aggregations.sources.buckets)
        ])
            .then(([osfProviders, hits]) => {
                // Get the whitelist and add the OSF Providers to it
                const whiteList = this.get('whiteListedProviders')
                    .concat(osfProviders
                        .map(osfProvider => osfProvider.toLowerCase())
                    );
                // Filter out providers that are not on the whitelist
                const providers = hits
                    .filter(hit => whiteList.includes(hit.key.toLowerCase()));

                // Add the OSF Providers that are not in SHARE
                providers.push(
                    ...osfProviders
                    .filter(osfProvider => !providers
                        .find(hit => hit.key.toLowerCase() === osfProvider.toLowerCase())
                    )
                    .map(key => ({
                        key,
                        doc_count: 0
                    }))
                );

                // Sort the providers list add add OSF to the top
                providers
                    .sort((a, b) => a.key.toLowerCase() < b.key.toLowerCase() ? -1 : 1)
                    .unshift(
                        ...providers.splice(
                            providers.findIndex(item => item.key === 'OSF'),
                            1
                        )
                    );

                if (!this.get('theme.isProvider')) {
                    this.set('otherProviders', providers);
                } else {
                    const filtered = providers.filter(
                        item => item.key.toLowerCase() === this.get('theme.id').toLowerCase()
                    );

                    this.set('otherProviders', filtered);
                    this.get('activeFilters.providers').pushObject(filtered[0].key);
                }

                this.notifyPropertyChange('otherProviders');
            });

        this.loadPage();
    },
    subjectChanged: Ember.observer('subjectFilter', function() {
        Ember.run.once(() => {
            let filter = this.get('subjectFilter');
            if (!filter || filter === 'true') return;
            this.set('activeFilters.subjects', filter.split('AND'));
            this.notifyPropertyChange('activeFilters');
            this.loadPage();
        });
    }),
    providerChanged: Ember.observer('providerFilter', function() {
        if (!this.get('theme.isProvider')) {
            Ember.run.once(() => {
                let filter = this.get('providerFilter');
                if (!filter || filter === 'true') return;
                this.set('activeFilters.providers', filter.split('AND'));
                this.notifyPropertyChange('activeFilters');
                this.set('providersPassed', true);
                this.loadPage();
            });
        }
    }),
    loadPage() {
        this.set('loading', true);
        Ember.run.debounce(this, this._loadPage, 500);
    },
    _loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());

        return Ember.$.ajax({
            url: this.get('searchUrl'),
            crossDomain: true,
            type: 'POST',
            contentType: 'application/json',
            data: queryBody
        }).then(json => {
            if (this.isDestroyed || this.isDestroying) return;

            this.set('numberOfResults', json.hits.total);

            let results = json.hits.hits.map(hit => {
                // HACK: Make share data look like apiv2 preprints data
                let result = Ember.merge(hit._source, {
                    id: hit._id,
                    type: 'elastic-search-result',
                    workType: hit._source['@type'],
                    abstract: hit._source.description,
                    subjects: hit._source.subjects.map(each => ({text: each})),
                    providers: hit._source.sources.map(item => ({name: item})),
                    osfProvider: hit._source.sources.reduce((acc, source) => (acc || this.get('osfProviders').includes(source)), false),
                    hyperLinks: [// Links that are hyperlinks from hit._source.lists.links
                        {
                            type: 'share',
                            url: config.SHARE.baseUrl + 'preprint/' + hit._id
                        }
                    ],
                    infoLinks: [] // Links that are not hyperlinks  hit._source.lists.links
                });

                hit._source.identifiers.forEach(function(identifier) {
                    if (identifier.startsWith('http://')) {
                        result.hyperLinks.push({url: identifier});
                    } else {
                        const spl = identifier.split('://');
                        const [type, uri] = spl;
                        result.infoLinks.push({type, uri});
                    }
                });

                result.contributors = result.lists.contributors
                  .sort((b, a) => (b.order_cited || -1) - (a.order_cited || -1))
                  .map(contributor => ({
                        users: Object.keys(contributor)
                          .reduce(
                              (acc, key) => Ember.merge(acc, {[key.camelize()]: contributor[key]}),
                              {bibliographic: contributor.relation !== 'contributor'}
                          )
                    }));

                // Temporary fix to handle half way migrated SHARE ES
                // Only false will result in a false here.
                result.contributors.map(contributor => contributor.users.bibliographic = !(contributor.users.bibliographic === false));  // jshint ignore:line

                return result;
            });

            this.set('loading', false);
            return this.set('results', results);
        });
    },
    totalPages: Ember.computed('numberOfResults', 'size', function() {
        return Math.ceil(this.get('numberOfResults') / this.get('size'));
    }),

    maxPages: Ember.computed('numberOfResults', function() {
        return ((this.get('numberOfResults') / this.get('size')) | 0) + (this.get('numberOfResults') % 10 === 0 ? 0 : 1);
    }),

    // TODO update this property if a solution is found for the elastic search limitation.
    // Ticket: SHARE-595
    numPages: Ember.computed('size', 'totalPages', function() {
        let maxPages = Math.ceil(10000 / this.get('size'));
        return this.get('totalPages') < maxPages ? this.get('totalPages') : maxPages;
    }),

    getQueryBody() {
        const facetFilters = this.get('activeFilters');

        this.set('subjectFilter', facetFilters.subjects.join('AND'));

        if (!this.get('theme.isProvider'))
            this.set('providerFilter', facetFilters.providers.join('AND'));

        const filter = [
            {
                terms: {
                    type: [
                        'preprint'
                    ]
                }
            }
        ];

        // TODO set up ember to transpile Object.entries
        for (const key in filterMap) {
            const val = filterMap[key];
            const filterList = facetFilters[key];

            if (!filterList.length || (key === 'providers' && this.get('theme.isProvider')))
                continue;

            filter.push({
                terms: {
                    [val]: filterList
                }
            });
        }

        if (this.get('theme.isProvider')) {
            filter.push({
                terms: {
                    sources: [this.get('theme.provider.name')]
                }
            });
        }

        const sort = {};
        const i18n = this.get('i18n');
        const sortByOption = this.get('sortByOption').toString();

        if (sortByOption === i18n.t('discover.sort_oldest_newest').toString()) {
            sort.date_updated = 'asc';
        } else if (sortByOption === i18n.t('discover.sort_newest_oldest').toString()) {
            sort.date_updated = 'desc';
        }

        return this.set('queryBody', {
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: elasticEscape(this.get('queryString')) || '*'
                        }
                    },
                    filter
                }
            },
            sort,
            from: (this.get('page') - 1) * this.get('size'),
        });
    },

    reloadSearch: Ember.observer('activeFilters', function() {
        this.set('page', 1);
        this.loadPage();
    }),

    _clearFilters() {
        this.set('activeFilters', {
            providers: this.get('theme.isProvider') ? this.get('activeFilters.providers') : [],
            subjects: []
        });
    },

    _clearQueryString() {
        this.set('queryString', '');
    },

    otherProviders: [],
    actions: {
        search(val, event) {
            if (event &&
                (
                    event.keyCode < 49 ||
                    [91, 92, 93].includes(event.keyCode)
                ) &&
                ![8, 32, 48].includes(event.keyCode)
            )
                return;

            this.set('page', 1);
            this.loadPage();

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: `${event && event.type === 'keyup' ? 'input' : 'button'}`,
                    action: `${event && event.type === 'keyup' ? 'onkeyup' : 'click'}`,
                    label: 'Preprints - Discover - Search'
                });
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

        setLoadPage(pageNumber) {
            this.set('page', pageNumber);
            this.loadPage();
            window.scrollTo(0, Ember.$('#searchResults').position().top - Ember.$('.preprint-navbar').height()*2 - 10);
        },

        clearFilters() {
            this._clearFilters();

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Discover - Clear Filters'
                });
        },

        sortBySelect(index) {
            // sets the variable for the selected option and reloads the page
            this.set('sortByOption', this.get('sortByOptions')[index]);
            this.set('page', 1);
            this.loadPage();

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: `Preprints - Discover - Sort by: ${this.get('sortByOptions')[index]}`
                });
        },

        updateFilters(filterType, item) {
            item = typeof item === 'object' ? item.text : item;
            const filters = this.get(`activeFilters.${filterType}`);
            const hasItem = filters.includes(item);
            const action = hasItem ? 'remove' : 'push';
            filters[`${action}Object`](item);
            this.notifyPropertyChange('activeFilters');

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'filter',
                    action: hasItem ? 'remove' : 'add',
                    label: `Preprints - Discover - ${filterType} ${item}`
                });
        },

    },
});
