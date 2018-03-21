import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Index Controller
 */
export default Controller.extend(Analytics, {
    theme: inject(),
    host: config.OSF.url,
    actions: {
        contactLink(href, category, action, label) {
            const metrics = get(this, 'metrics');

            // TODO submit PR to ember-metrics for a trackSocial function for Google Analytics. For now, we'll use trackEvent.
            metrics.trackEvent({
                category,
                action,
                label
            });

            if (label.includes('email'))
              return;

            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            return false;
        }
    }
});
