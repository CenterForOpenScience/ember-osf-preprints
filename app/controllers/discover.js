import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import config from 'ember-get-config';
import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';

import Analytics from 'ember-osf/mixins/analytics';
import { transformShareData, buildLockedQueryBody, constructBasicFilters, buildQueryBody } from 'ember-osf/utils/discover-page';

import { getSplitParams, encodeParams, getFilter } from '../utils/elastic-query';

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
const DEBOUNCE_MS = 250;

const filterQueryParams = {
    start: {
        defaultValue: '',
        refresh: true,
    },
    end: {
        defaultValue: '',
        refresh: true,
    },
    subject: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return value.join('OR');
        },
        deserialize(value) {
            return value.split('OR');
        },
    },
    provider: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return value.join('OR');
        },
        deserialize(value) {
            return value.split('OR');
        },
    },
    type: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return encodeParams(value);
        },
        deserialize(value = '') {
            return getSplitParams(value) || [];
        },
    },
    tags: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return encodeParams(value);
        },
        deserialize(value = '') {
            return getSplitParams(value) || [];
        },
    },
    sources: {
        defaultValue: [],
        refresh: true,
        serialize(value) {
            return encodeParams(value);
        },
        deserialize(value = '') {
            return getSplitParams(value) || [];
        },
    },
};

export const discoverQueryParams = new QueryParams(
    filterQueryParams,
    {
        q: {
            defaultValue: '',
            refresh: true,
            replace: true,
        },
        size: {
            defaultValue: 10,
            refresh: true,
        },
        sort: {
            defaultValue: '',
            refresh: true,
        },
        page: {
            defaultValue: 1,
            refresh: true,
        },
    },
);

export default Controller.extend(Analytics, discoverQueryParams.Mixin, {
    i18n: service(),
    theme: service(),
    currentUser: service(),
    metrics: service(),

    consumingService: 'preprints',
    detailRoute: 'content',

    filterMap: { // Map active filters to facet names expected by SHARE
        provider: 'sources',
        subject: 'subjects',
    },

    // TODO: Add a conversion from shareSource to provider names here if desired
    filterReplace: { // Map filter names for front-end display
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Preprints',
        'Research Papers in Economics': 'RePEc',
    },

    queryParamsChanged: computed.or('queryParamsState.{page,sort,q,tags,sources,type,start,end,subject,provider}.changed'),

    whiteListedProviders: alias('meta.whitelisted_providers'),

    additionalProviders: computed('themeProvider', function() {
        // for now, using this property to alter many pieces of the landing/discover page
        return (this.get('themeProvider.additionalProviders') || []).length > 1;
    }),

    discoverHeader: computed('additionalProviders', function() {
        // If additionalProviders, use more generic Repository Search page title
        return this.get('additionalProviders') ?
            'discover.search.heading_repository_search' :
            'discover.search.heading';
    }),

    externalProviders: computed('model', function() {
        return this.get('model').filter(item => item.id !== 'osf');
    }),

    facets: computed('i18n.locale', 'additionalProviders', function() {
        if (this.get('additionalProviders')) {
            // if additionalProviders exist, use subset of SHARE facets (LiveData)
            return [
                {
                    key: 'sources',
                    title: this.get('i18n').t('discover.main.source'),
                    component: 'search-facet-source',
                }, {
                    key: 'date',
                    title: this.get('i18n').t('discover.main.date'),
                    component: 'search-facet-daterange',
                    filter: 'dateRangeFilter',
                }, {
                    key: 'type',
                    title: this.get('i18n').t('discover.main.type'),
                    component: 'search-facet-worktype',
                    data: {},
                }, {
                    key: 'tags',
                    title: this.get('i18n').t('discover.main.tag'),
                    component: 'search-facet-typeahead',
                },
            ];
        } else {
            // Regular preprints and branded preprints get provider and taxonomy facets
            return [
                {
                    key: 'provider',
                    title: `${this.get('i18n').t('discover.main.providers')}`,
                    component: 'search-facet-provider',
                }, {
                    key: 'subject',
                    title: `${this.get('i18n').t('discover.main.subject')}`,
                    component: 'search-facet-taxonomy',
                },
            ];
        }
    }),

    lockedParams: computed('additionalProviders', function() {
        // Query parameters that cannot be changed.
        // if additionalProviders, search for all types
        return this.get('additionalProviders') ? {} : {
            bool: {
                should: [
                    { terms: { types: ['preprint'] } },
                    { terms: { sources: ['Thesis Commons'] } },
                ],
            },
        };
    }),

    searchPlaceholder: computed('additionalProviders', function() {
        return this.get('additionalProviders') ?
            'discover.search.repository_placeholder' :
            'discover.search.placeholder';
    }),

    showActiveFilters: computed('additionalProviders', function() {
        // Whether Active Filters should be displayed.
        // additionalProviders (LiveData) are using SHARE facets which do not
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

    themeProvider: computed('model', function() { // Pulls the preprint provider from the already loaded model
        let themeProvider = null;
        this.get('model').forEach((provider) => {
            if (provider.id === this.get('theme.id')) {
                themeProvider = provider;
            }
        });
        return themeProvider;
    }),

    searchUrl: computed('currentUser.sessionKey', function() {
        // Pulls SHARE search url from config file.
        const preference = this.get('currentUser.sessionKey');
        return `${config.OSF.shareSearchUrl}?preference=${preference}`;
    }),

    actions: {
        clearFilters() {
            this.resetQueryParams(Object.keys(filterQueryParams));
        },
        search() {
            this.get('fetchData').perform(this.get('allQueryParams'));
        },
    },

    setup({ queryParams }) {
        this.get('fetchData').perform(queryParams);
    },

    queryParamsDidChange({ shouldRefresh, queryParams, changed }) {
        if (queryParams.page !== 1 && !changed.page) {
            this.set('page', 1);
        }

        if (changed.q) {
            this.get('trackDebouncedSearch').perform();
        }

        if (shouldRefresh) {
            this.get('fetchData').perform(queryParams);
        }
    },

    reset(isExiting) {
        if (isExiting) {
            this.resetQueryParams();
        }
    },

    constructFacetFilters() {
        const filters = {};
        this.get('facets').forEach((facet) => {
            const filterType = facet.filter || 'termsFilter';
            const field = facet.filterName || facet.key;

            let terms = null;
            let start = null;
            let end = null;

            if (filterType === 'dateRangeFilter') {
                start = this.get('queryParamsState').start.value;
                end = this.get('queryParamsState').end.value;
            } else {
                terms = this.get('queryParamsState')[field].value;
            }

            filters[field] = getFilter(field, filterType, terms, start, end);
        });

        return filters;
    },

    getQueryBody(queryParams) {
        /**
         * Builds query body to send to SHARE from a combination of
         * locked Params, facetFilters and activeFilters
         *
         * @method getQueryBody
         * @return queryBody
         */
        let lockedFilters = buildLockedQueryBody(this.get('lockedParams')); // Empty list if no locked query parameters
        // From Ember-SHARE. Looks at facetFilters
        // (partial SHARE queries already built) and adds them to query body
        if (this.get('additionalProviders')) {
            const facetFilters = this.constructFacetFilters();
            for (const k of Object.keys(facetFilters)) {
                const filter = facetFilters[k];
                if (filter) {
                    if ($.isArray(filter)) {
                        lockedFilters = lockedFilters.concat(filter);
                    } else {
                        lockedFilters.push(filter);
                    }
                }
            }
        }

        const filters = constructBasicFilters(
            this.get('filterMap'),
            lockedFilters,
            this.get('theme.isProvider'),
            queryParams,
        );

        // If theme.isProvider, add provider(s) to query body
        if (this.get('themeProvider')) {
            const themeProvider = this.get('themeProvider');
            let sources = [];
            /*
             * Regular preprint providers will have their search results
             * restricted to the one provider.
             * If the provider has additionalProviders, all of these providers
             * will be added to the "sources" SHARE query
             */
            if (this.get('theme.isProvider')) {
                sources = (themeProvider.get('additionalProviders') || []).length ?
                    themeProvider.get('additionalProviders') :
                    [themeProvider.get('shareSource') || themeProvider.get('name')];
            } else if (this.get('themeProvider.id') === 'osf') {
                let osfProviderSources = [themeProvider.get('shareSource') || 'OSF'];

                osfProviderSources = osfProviderSources.concat(this.get('externalProviders')
                    .map(provider => provider.get('shareSource') || provider.get('name')));

                sources = this.get('whiteListedProviders') ?
                    osfProviderSources.concat(this.get('whiteListedProviders')) :
                    osfProviderSources;
            }

            filters.push({
                terms: {
                    sources,
                },
            });
        }

        return buildQueryBody(queryParams, filters, this.get('queryParamsChanged'));
    },

    trackDebouncedSearch: task(function* () {
        yield timeout(DEBOUNCE_MS);
        this.get('metrics').trackEvent({
            category: 'input',
            action: 'onkeyup',
            label: 'Discover - Search',
            extra: this.get('q'),
        });
    }).restartable(),

    fetchData: task(function* (queryParams) {
        yield timeout(DEBOUNCE_MS);
        const queryBody = this.getQueryBody(queryParams);

        try {
            const response = yield $.ajax({
                url: this.get('searchUrl'),
                crossDomain: true,
                type: 'POST',
                contentType: 'application/json',
                data: queryBody,
            });

            const results = response.hits.hits.map((hit) => {
                // Make share data look like apiv2 preprints data
                return transformShareData(hit);
            });

            if (response.aggregations) {
                this.set('aggregations', response.aggregations);
            }

            this.setProperties({
                numberOfResults: response.hits.total,
                results,
                queryError: false,
            });
        } catch (errorResponse) {
            this.setProperties({
                numberOfResults: 0,
                results: [],
            });

            if (errorResponse.status === 400) {
                this.set('queryError', true);
            } else {
                this.send('elasticDown');
            }
        }
    }).restartable(),
});
