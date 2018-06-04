import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule components
 */

const SUBMIT_LABEL = {
    none: 'global.add_preprint',
    moderated: 'global.submit_preprint',
};

/**
 * Preprint navbar with branding for a specific provider -
 * use in application.hbs to drop preprint-navbar-branded onto every page
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
    session: service(),
    theme: service(),
    currentUser: service(),

    tagName: 'nav',
    classNames: ['navbar', 'branded-navbar', 'preprint-navbar'],
    submitLabel: computed('model.reviewsWorkflow', function() {
        return this.get('model.reviewsWorkflow') ?
            SUBMIT_LABEL.moderated :
            SUBMIT_LABEL.none;
    }),
    host: config.OSF.url,
});
