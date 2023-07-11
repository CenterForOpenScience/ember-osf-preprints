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
 * Displays top level disciplines for preprints index page
 *
 * Sample usage:
 * ```handlebars
 * {{taxonomy-top-list
 *     list=model.taxonomies
 * }}
 * ```
 * @class taxonomy-top-list
 */
export default Component.extend(Analytics, {
    theme: service(),
    sortedList: computed('list', 'list.content', function() {
        if (!this.get('list')) {
            return;
        }
        const sortedList = this.get('list').sortBy('text');
        const pairedList = [];
        for (let i = 0; i < sortedList.get('length'); i += 2) {
            const pair = [];
            // path in pair needs to be a list because that's what the
            // subject param in the discover controller is expecting
            const subjectOdd = sortedList.objectAt(i);
            pair.pushObject({
                path: [subjectOdd.get('path')],
                text: subjectOdd.get('text'),
            });

            if (sortedList.objectAt(i + 1)) {
                const subjectEven = sortedList.objectAt(i + 1);
                pair.pushObject({
                    path: [subjectEven.get('path')],
                    text: subjectEven.get('text'),
                });
            }
            pairedList.pushObject(pair);
        }
        return pairedList;
    }),
    osfUrl: config.OSF.url,
});
