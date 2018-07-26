import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule controllers
 */

const SUBMIT_LABEL = {
    none: 'global.add_preprint',
    moderated: 'global.submit_preprint',
};

/**
 * @class Index Controller
 */
export default Controller.extend(Analytics, {
    theme: service(),
    submitLabel: computed('theme.provider.content.reviewsWorkflow', function() {
        return this.get('theme.provider.content.reviewsWorkflow') ?
            SUBMIT_LABEL.moderated :
            SUBMIT_LABEL.none;
    }),
    actions: {
        contactLink(href, category, action, label) {
            const metrics = this.get('metrics');

            // TODO submit PR to ember-metrics for a trackSocial function for
            // Google Analytics. For now, we'll use trackEvent.
            metrics.trackEvent({
                category,
                action,
                label,
            });

            if (label.includes('email')) { return; }

            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            return false;
        },
    },
    host: config.OSF.url,
});
