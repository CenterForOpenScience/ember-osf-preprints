import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';
import { merge } from '@ember/polyfills';
import { camelize } from '@ember/string';

import config from 'ember-get-config';
import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';

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
const MAX_SOURCES = 500;
const DEBOUNCE_MS = 250;

const elasticAggregations = {
    sources: {
        terms: {
            field: 'sources',
            size: MAX_SOURCES,
        },
    },
};

const filterQueryParamsList = ['tags', 'sources', 'type', 'subject', 'provider'];

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
    page: {
        defaultValue: 1,
        refresh: true,
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
    },
);

export default Controller.extend(Analytics, discoverQueryParams.Mixin, {
    i18n: service(),
    theme: service(),
    currentUser: service(),
    // q query param.  Must be passed to component, so can be reflected in URL
    // queryParams: ['page', 'q', 'sources', 'tags', 'type', 'start', 'end', 'subject', 'provider'],
    activeFilters: { provider: [], subject: [] },
    consumingService: 'preprints',
    detailRoute: 'content',

    filterMap: { // Map active filters to facet names expected by SHARE
        provider: 'sources',
        subject: 'subjects',
    },

    // TODO: Add a conversion from shareSource to provider names here if desired
    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Preprints',
        'Research Papers in Economics': 'RePEc',
    },

    queryParamsChanged: computed.or('queryParamsState.{page,sort,q,tags,sources,type,start,end,subject,provider}.changed'),

    additionalProviders: computed('themeProvider', function() { // Do additionalProviders exist?
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
        // if additionalProviders exist, use subset of SHARE facets (LiveData)
        if (this.get('additionalProviders')) {
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
        } else { // Regular preprints and branded preprints get provider and taxonomy facets
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

    searchUrl: computed(function() {
        // Pulls SHARE search url from config file.
        const preference = this.get('currentUser.sessionKey');
        return `${config.OSF.shareSearchUrl}?preference=${preference}`;
    }),

    actions: {
        clearFilters() {
            this.resetQueryParams();
        },
    },

    setup({ queryParams }) {
        this.get('fetchData').perform(queryParams);
    },

    queryParamsDidChange({ shouldRefresh, queryParams, changed }) {
        if (queryParams.page !== 1 && !changed.page) {
            this.set('page', 1);
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

    buildLockedQueryBody(lockedParams) {
        /**
         *  For PREPRINTS, REGISTRIES, RETRACTION WATCH
         *  services where portion of query is restricted.
         *  Builds the locked portion of the query.
         *  For example, in preprints, types=['preprint', 'thesis']
         *  is something that cannot be modified by the user.
         *
         *  @method buildLockedQueryBody
         *  @param {Object} lockedParams - Locked param keys matched to the locked value.
         *  @return {Object} queryBody - locked portion of query body
        */
        const queryBody = [];
        Object.keys(lockedParams).forEach((key) => {
            const query = {};
            let queryKey = [`${key}`];
            if (key === 'tags') {
                queryKey = key;
            } else if (key === 'contributors') {
                queryKey = 'lists.contributors.name';
            }
            query[queryKey] = lockedParams[key];
            if (key === 'bool') {
                queryBody.push(query);
            } else {
                queryBody.push({
                    terms: query,
                });
            }
        });
        return queryBody;
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
        let filters = this.buildLockedQueryBody(this.get('lockedParams')); // Empty list if no locked query parameters
        // From Ember-SHARE. Looks at facetFilters
        // (partial SHARE queries already built) and adds them to query body
        const facetFilters = this.constructFacetFilters();
        for (const k of Object.keys(facetFilters)) {
            const filter = facetFilters[k];
            if (filter) {
                if ($.isArray(filter)) {
                    filters = filters.concat(filter);
                } else {
                    filters.push(filter);
                }
            }
        }

        // For PREPRINTS and REGISTRIES.  Adds activeFilters to query body.
        const activeFilters = this.get('activeFilters');
        const filterMap = this.get('filterMap');
        Object.keys(filterMap).forEach((key) => {
            const val = filterMap[key];
            const filterList = activeFilters[key];
            this.set(key, filterList);

            if (!filterList.length || (key === 'provider' && this.get('theme.isProvider'))) {
                return;
            }

            if (val === 'subject') {
                const matched = [];
                for (const filter of filterList) {
                    matched.push({
                        match: {
                            [val]: filter,
                        },
                    });
                }

                filters.push({
                    bool: {
                        should: matched,
                    },
                });
            } else {
                filters.push({
                    terms: {
                        [val]: filterList,
                    },
                });
            }
        });

        // For PREPRINTS and REGISTRIES. If theme.isProvider, add provider(s) to query body
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

        let query = {
            query_string: {
                query: queryParams.q || '*',
            },
        };

        if (filters.length) {
            query = {
                bool: {
                    must: query,
                    filter: filters,
                },
            };
        }

        const page = this.get('page');
        const queryBody = {
            query,
            from: (page - 1) * this.get('size'),
        };

        if (this.get('sort')) {
            const sortBy = {};
            sortBy[this.get('sort').replace(/^-/, '')] = this.get('sort')[0] === '-' ? 'desc' : 'asc';
            queryBody.sort = sortBy;
        }

        if (page === 1 || this.get('firstLoad')) {
            queryBody.aggregations = elasticAggregations;
        }

        return this.set('queryBody', queryBody);
    },

    fetchData: task(function* (queryParams) {
        yield timeout(DEBOUNCE_MS);
        const queryBody = JSON.stringify(this.getQueryBody(queryParams));

        try {
            const response = yield $.ajax({
                url: this.get('searchUrl'),
                crossDomain: true,
                type: 'POST',
                contentType: 'application/json',
                data: queryBody,
            });

            const results = response.hits.hits.map((hit) => {
                // HACK: Make share data look like apiv2 preprints data
                const result = merge(hit._source, {
                    id: hit._id,
                    type: 'elastic-search-result',
                    workType: hit._source['@type'],
                    abstract: hit._source.description,
                    subjects: hit._source.subjects.map(each => ({ text: each })),
                    subject_synonyms: hit._source.subject_synonyms.map(each => ({ text: each })),
                    providers: hit._source.sources.map(item => ({ // PREPRINTS, REGISTRIES
                        name: item,
                    })),
                    hyperLinks: [ // Links that are hyperlinks from hit._source.lists.links
                        {
                            type: 'share',
                            url: `${config.OSF.shareBaseUrl}${hit._source.type.replace(/ /g, '')}/${hit._id}`,
                        },
                    ],
                    infoLinks: [], // Links that are not hyperlinks  hit._source.lists.links
                    registrationType: hit._source.registration_type, // For REGISTRIES
                });

                hit._source.identifiers.forEach(function(identifier) {
                    if (identifier.startsWith('http://')) {
                        result.hyperLinks.push({ url: identifier });
                    } else {
                        const spl = identifier.split('://');
                        const [type, uri, ..._] = spl;
                        result.infoLinks.push({ type, uri });
                    }
                });

                result.contributors = result.lists.contributors ? result.lists.contributors
                    .sort((b, a) => (b.order_cited || -1) - (a.order_cited || -1))
                    .map(contributor => ({
                        users: Object.keys(contributor)
                            .reduce(
                                (acc, key) => merge(acc, { [camelize(key)]: contributor[key] }),
                                { bibliographic: contributor.relation !== 'contributor' },
                            ),
                    })) : [];

                // Temporary fix to handle half way migrated SHARE ES
                // Only false will result in a false here.
                result.contributors.map(contributor => contributor.users.bibliographic = !(contributor.users.bibliographic === false));

                return result;
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

    whiteListedProviders: config.whiteListedProviders,
});
