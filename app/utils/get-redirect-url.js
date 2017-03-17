/**
 * @module ember-preprints
 * @submodule utils
 */

/**
 * Determines the redirect URL for branded preprint domains
 *
 * @class getRedirectUrl
 * @param {object} location - The window location object
 * @param {string} location.pathname
 * @param {string} location.host
 * @param {string} location.origin
 * @param {string} domain - The domain to redirect to
 * @param {string} [slug] - The trailing part of the URL
 * @return {string} - The full redirect URL
 */
export default function(location, domain, slug) {
    const pathRegex = new RegExp(`^/preprints(/${slug})?`);
    const {pathname, host, origin} = location;
    const newOrigin = origin.replace(host, domain);
    const newPath = pathname.replace(pathRegex, '');

    return `${newOrigin}${newPath}`;
}
