import moment from 'moment';

/*
 * @function dateRangeFilter
 * @param String field Name of the date field to filter
 * @param Object start Beginning of date range
 * @param Object end End of date range
 */
function dateRangeFilter(field, start, end) {
    if (start && end) {
        const filter = { range: {} };
        filter.range[field] = {
            gte: `${moment(start).format('YYYY-MM-DD')}||/d`,
            lte: `${moment(end).format('YYYY-MM-DD')}||/d`,
        };
        return filter;
    } else {
        return null;
    }
}

/*
 * @function termsFilter
 * @param String field Name of the field to filter
 * @param Array terms List of terms to match
 * @param Boolean [all] If true (default), return an array of filters to match
 * results with *all* of the terms. Otherwise, return a single filter to match
 * results with *any* of the terms.
 */
function termsFilter(field, terms, all = true) {
    if (terms && terms.length) {
        let tmpField = field;
        if (['contributors', 'funders', 'identifiers', 'tags', 'publishers'].includes(tmpField)) {
            tmpField = `${field}.exact`;
        }
        if (all) {
            return terms.map((term) => {
                const filter = { term: {} };
                // creative work filter should not include subtypes
                if (term === 'creative work' && tmpField === 'types') {
                    filter.term.type = term;
                } else {
                    filter.term[tmpField] = term;
                }
                return filter;
            });
        } else {
            const filter = { terms: {} };
            filter.terms[tmpField] = terms;
            return filter;
        }
    } else {
        return null;
    }
}

function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}

function getUniqueList(data) {
    const value = data || [];
    return value.filter(uniqueFilter);
}

function encodeParams(tags) {
    return tags.map(tag => tag.replace(/,/g, ',\\'));
}

function decodeParams(param) {
    return param.split(/,(?!\\)/).map(function(tag) {
        return tag.replace(/,\\/g, ',');
    });
}

function getSplitParams(params) {
    if (!params.length) {
        return params.slice(0);
    } else if (params.length && $.isArray(params[0])) {
        return params[0];
    } else if (params.length && typeof (params) === 'string') {
        return decodeParams(params);
    } else if (params.length === 1) {
        return decodeParams(params[0]);
    }
    return params;
}

/*
 * @function getFilter
 * @param String field Name of the field to filter
 * @param String filter Name of the function to build the filter
 * @param Array terms List of terms to match
 * @param Object start Beginning of date range
 * @param Object end End of date range
 */
function getFilter(field, filter, terms = [], start = null, end = null) {
    if (filter === 'termsFilter') {
        return termsFilter(field, getUniqueList(terms));
    } else {
        return dateRangeFilter(field, start, end);
    }
}

export {
    dateRangeFilter,
    termsFilter,
    getUniqueList,
    encodeParams,
    decodeParams,
    getSplitParams,
    getFilter,
};
