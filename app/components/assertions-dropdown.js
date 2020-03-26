import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    tagName: 'span',

    available: null,
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

