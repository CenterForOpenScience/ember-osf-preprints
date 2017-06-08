import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Discover Controller
 *
 * Most of the discover page is built using the discover-page component in ember-osf. The component is largely based on
 * SHARE's discover interface (https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js) and
 * the existing preprints interface
 */

export default Ember.Controller.extend(Analytics, {
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(),
    activeFilters: { providers: [], subjects: [] },
    additionalProviders: Ember.computed('themeProvider', function() { // Do additional Providers exist?
        return (this.get('themeProvider.additionalProviders') || []).length > 1;
    }),
    consumingService: 'preprints', // Consuming service - preprints here
    detailRoute: 'content', // Name of detail route for this application
    discoverHeader: Ember.computed('i18n', 'additionalProviders', function() { // Header for preprints discover page
        // If additionalProviders, use more generic Repository Search
        return this.get('additionalProviders') ? this.get('i18n').t('discover.search.heading_repository_search') : this.get('i18n').t('discover.search.heading');
    }),
    end: '', // End query param. Must be passed to component, so can be reflected in the URL
    facets: Ember.computed('i18n.locale', 'additionalProviders', function() { // List of facets available for preprints
        if (this.get('additionalProviders')) { // if additionalProviders exist, use subset of SHARE facets
            return [
                { key: 'sources', title: this.get('i18n').t('discover.main.source'), component: 'search-facet-source'},
                { key: 'date', title: this.get('i18n').t('discover.main.date'), component: 'search-facet-daterange'},
                { key: 'type', title: this.get('i18n').t('discover.main.type'), component: 'search-facet-worktype'},
                { key: 'tags', title: this.get('i18n').t('discover.main.tag'), component: 'search-facet-typeahead'},
            ];
        } else { // Regular preprints and branded preprints get provider and taxonomy facets
            return [
                { key: 'sources', title: `${this.get('i18n').t('discover.main.providers')}`, component: 'search-facet-provider' },
                { key: 'subjects', title: `${this.get('i18n').t('discover.main.subject')}`, component: 'search-facet-taxonomy' }
            ]
        }
    }),
    filterMap: { // Map active filters to facet names expected by SHARE
        providers: 'sources',
        subjects: 'subjects'
    },
    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Preprints',
        'Research Papers in Economics': 'RePEc'
    },
    lockedParams: Ember.computed('additionalProviders', function() { // Query parameters that cannot be changed.
        // if additionalProviders, open up search results to all types of results. Otherwise, restrict to just preprints.
        return this.get('additionalProviders') ? {} : {types: 'preprint'};
    }),
    page: 1, // Page query param. Must be passed to component, so can be reflected in URL
    provider: '', // Provider query param. Must be passed to component, so can be reflected in URL
    q: '', // q query param.  Must be passed to component, so can be reflected in URL
    queryParams: ['page', 'q', 'sources', 'tags', 'type', 'start', 'end', 'subject', 'provider'], // Pass in the list of queryParams for this component
    searchPlaceholder: Ember.computed('i18n', function() { // Search bar placeholder
        return this.get('i18n').t('discover.search.placeholder');
    }),
    showActiveFilters: Ember.computed('additionalProviders', function() {  // Whether Active Filters should be displayed.
        // additionalProviders are using SHARE facets which do not work with Active Filters at this time
        return !this.get('additionalProviders');
    }),
    sortOptions: Ember.computed('i18n.locale', function() { // Sort options for preprints
        const i18n = this.get('i18n');
        return [{
            display: i18n.t('discover.relevance'),
            sortBy: ''
        }, {
            display: i18n.t('discover.sort_oldest_newest'),
            sortBy: 'date_updated'
        }, {
            display: i18n.t('discover.sort_newest_oldest'),
            sortBy: '-date_updated'
        }];
    }),
    sources: '', // Sources query param. Must be passed to component, so can be reflected in the URL
    start: '', // Start query param. Must be passed to component, so can be reflected in the URL
    subject: '', // Subject query param.  Must be passed to component, so can be reflected in URL
    tags: '', // Tags query param.  Must be passed to component, so can be reflected in URL
    themeProvider: Ember.computed('model', function() { // Pulls the preprint provider from the already loaded model
        let themeProvider = null;
        this.get('model').forEach(provider => {
            if (provider.id === this.get('theme.id')) {
                themeProvider = provider;
            }
        });
        return themeProvider;
    }),
    type: '', //Type query param. Must be passed to component, so can be reflected in URL
    _clearFilters() {
        this.set('activeFilters', {
            providers: [],
            subjects: []
        });
        this.set('provider', '');
        this.set('subject', '');
    },
    _clearQueryString() {
        this.set('q', '');
    }
});
