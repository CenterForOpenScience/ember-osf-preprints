import Component from '@ember/component';
import { inject } from '@ember/service';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint navbar with branding for a specific provider - use in application.hbs to drop preprint-navbar-branded onto every page
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-navbar-branded
 *    model=theme.provider
 * }}
 *
 * ```
 * @class preprint-navbar-branded
 */
export default Component.extend(OSFAgnosticAuthControllerMixin, Analytics, {
    session: inject(),
    theme: inject(),
    currentUser: inject(),

    tagName: 'nav',
    classNames: ['navbar', 'branded-navbar', 'preprint-navbar'],
    host: config.OSF.url,
});
