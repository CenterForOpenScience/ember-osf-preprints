import Component from '@ember/component';
import { computed } from '@ember/object';
import { capitalize } from '@ember/string';

import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    tagName: 'span',

    available: null,
    availability: computed('available', function() {
        const available = this.get('available');
        if (typeof available === 'string') {
            return capitalize(available.replace('_', ' '));
        }
        return available;
    }),
    actions: {
        onOpen(sloanField) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Open - ${sloanField}`,
                });
        },
    },
});

