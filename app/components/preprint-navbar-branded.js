import Ember from 'ember';
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
export default Ember.Component.extend(OSFAgnosticAuthControllerMixin, Analytics, {
    session: Ember.inject.service(),
    theme: Ember.inject.service(),
    currentUser: Ember.inject.service(),

    tagName: 'nav',
    classNames: ['navbar', 'branded-navbar', 'preprint-navbar'],
    host: config.OSF.url,
});
