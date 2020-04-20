import Component from '@ember/component';
import calculatePosition from 'ember-basic-dropdown/utils/calculate-position';
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
        calculatePosition(...args) {
            const pos = calculatePosition(...args);
            const [trigger, content] = args;

            const scroll = { left: window.pageXOffset, top: window.pageYOffset };
            const viewportWidth = document.body.clientWidth || window.innerWidth;
            if (viewportWidth < 769) {
                const { width: dropdownWidth } = content.getBoundingClientRect();
                const { left: triggerLeft, width: triggerWidth } = trigger.getBoundingClientRect();
                const triggerLeftWithScroll = triggerLeft + scroll.left;
                pos.style.left = triggerLeftWithScroll + ((triggerWidth - dropdownWidth) / 2);
            }

            return pos;
        },
    },
});

