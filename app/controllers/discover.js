import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Discover Controller
 *
 * Most of the discover page is built using the discover-page component in ember-osf.
 * The component is largely based on SHARE's discover interface
 * (https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js)
 * and the existing preprints interface
 */

export default Controller.extend(Analytics, {
    i18n: service(),
    theme: service(),
    // q query param.  Must be passed to component, so can be reflected in URL
    queryParams: ['page', 'q', 'sources', 'tags', 'type', 'start', 'end', 'subject', 'provider'],
    activeFilters: { providers: [], subjects: [] },
    consumingService: 'preprints',
    // Consuming service - preprints here
    detailRoute: 'content',
    end: '',
    filterMap: { // Map active filters to facet names expected by SHARE
        providers: 'sources',
        subjects: 'subjects',
    },
    // TODO: Add a conversion from shareSource to provider names here if desired
    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF Preprints',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Preprints',
        'Research Papers in Economics': 'RePEc',
    },
    page: 1,
    // Page query param. Must be passed to component, so can be reflected in URL
    provider: '',
    // Provider query param. Must be passed to component, so can be reflected in URL
    q: '',
    sources: '',
    // Sources query param. Must be passed to component, so can be reflected in the URL
    start: '',
    // Start query param. Must be passed to component, so can be reflected in the URL
    subject: '',
    // Subject query param.  Must be passed to component, so can be reflected in URL
    tags: '',
    type: '',
    whiteListedProviders: alias('meta.whitelisted_providers'),
    additionalProviders: computed('themeProvider', function() { // Do additionalProviders exist?
        // for now, using this property to alter many pieces of the landing/discover page
        return (this.get('themeProvider.additionalProviders') || []).length > 1;
    }),
    // Name of detail route for this application
    discoverHeader: computed('additionalProviders', function() { // Header for preprints discover page
        // If additionalProviders, use more generic Repository Search page title
        return this.get('additionalProviders') ? 'discover.search.heading_repository_search' : 'discover.search.heading';
    }),
    // End query param. Must be passed to component, so can be reflected in the URL
    externalProviders: computed('model', function() {
        return this.get('model').filter(item => item.id !== 'osf');
    }),
    facets: computed('i18n.locale', 'additionalProviders', function() { // List of facets available for preprints
        if (this.get('additionalProviders')) { // if additionalProviders exist, use subset of SHARE facets
            return [
                { key: 'sources', title: this.get('i18n').t('discover.main.source'), component: 'search-facet-source' },
                { key: 'date', title: this.get('i18n').t('discover.main.date'), component: 'search-facet-daterange' },
                { key: 'type', title: this.get('i18n').t('discover.main.type'), component: 'search-facet-worktype' },
                { key: 'tags', title: this.get('i18n').t('discover.main.tag'), component: 'search-facet-typeahead' },
            ];
        } else { // Regular preprints and branded preprints get provider and taxonomy facets
            return [
                { key: 'sources', title: `${this.get('i18n').t('discover.main.providers')}`, component: 'search-facet-provider' },
                { key: 'subjects', title: `${this.get('i18n').t('discover.main.subject')}`, component: 'search-facet-taxonomy' },
            ];
        }
    }),
    lockedParams: computed('additionalProviders', function() {
        // Query parameters that cannot be changed.
        // if additionalProviders, open up search results to all
        // types of results instead of just preprints.
        return this.get('additionalProviders') ? {} : {
            bool: {
                should: [
                    { terms: { types: ['preprint'] } },
                    { terms: { sources: ['Thesis Commons'] } },
                ],
            },
        };
    }),
    // Pass in the list of queryParams for this component
    searchPlaceholder: computed('additionalProviders', function() { // Search bar placeholder
        return this.get('additionalProviders') ? 'discover.search.repository_placeholder' : 'discover.search.placeholder';
    }),
    showActiveFilters: computed('additionalProviders', function() {
        // Whether Active Filters should be displayed.
        // additionalProviders are using SHARE facets which do not
        // work with Active Filters at this time
        return !this.get('additionalProviders');
    }),
    sortOptions: computed('i18n.locale', function() { // Sort options for preprints
        const i18n = this.get('i18n');
        return [{
            display: i18n.t('discover.relevance'),
            sortBy: '',
        }, {
            display: i18n.t('discover.sort_oldest_newest'),
            sortBy: 'date_updated',
        }, {
            display: i18n.t('discover.sort_newest_oldest'),
            sortBy: '-date_updated',
        }];
    }),
    // Tags query param.  Must be passed to component, so can be reflected in URL
    themeProvider: computed('model', function() { // Pulls the preprint provider from the already loaded model
        let themeProvider = null;
        this.get('model').forEach((provider) => {
            if (provider.id === this.get('theme.id')) {
                themeProvider = provider;
            }
        });
        return themeProvider;
    }),
    _clearFilters() {
        this.set('activeFilters', {
            providers: [],
            subjects: [],
        });
        this.set('provider', '');
        this.set('subject', '');
    },
    _clearQueryString() {
        this.set('q', '');
    },
});
