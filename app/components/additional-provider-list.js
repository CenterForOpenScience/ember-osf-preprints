import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays additional SHARE sources for preprints index page
 *
 * Sample usage:
 * ```handlebars
 * {{additional-provider-list
 *     additionalProviders=additionalProviders
 * }}
 * ```
 * @class additional-provider-list
 */
export default Component.extend(Analytics, {
    theme: service(),
    sortedList: computed('additionalProviders', function() {
        if (!this.get('additionalProviders')) {
            return;
        }
        const sortedList = this.get('additionalProviders').sort();
        const pairedList = [];
        for (let i = 0; i < sortedList.get('length'); i += 2) {
            const pair = [];
            // provider in pair needs to be a list because that's
            // what the discover controller is expecting
            pair.pushObject([sortedList.objectAt(i)]);
            if (sortedList.objectAt(i + 1)) {
                pair.pushObject([sortedList.objectAt(i + 1)]);
            }
            pairedList.pushObject(pair);
        }
        return pairedList;
    }),
    osfUrl: config.OSF.url,
});
