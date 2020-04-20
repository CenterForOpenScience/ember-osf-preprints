import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias, and, or } from '@ember/object/computed';

export default Component.extend({
    features: service(),

    preprint: null,
    provider: alias('preprint.provider'),
    documentType: alias('provider.documentType'),

    shouldShowSloanIcons: and('provider.inSloanStudy', 'hasASloanFlagEnabled', 'hasSloanData'),
    hasASloanFlagEnabled: or('sloanCoiDisplayEnabled', 'sloanDataDisplayEnabled', 'sloanPreregDisplayEnabled'),
    hasSloanData: or('hasCoi', 'hasDataLinks', 'hasPreregLinks'),

    shouldShowCoi: and('hasCoi', 'sloanCoiDisplayEnabled'),
    shouldShowDataLinks: and('hasDataLinks', 'sloanDataDisplayEnabled'),
    shouldShowPreregLinks: and('hasPreregLinks', 'sloanPreregDisplayEnabled'),

    sloanCoiDisplayEnabled: alias('features.sloanCoiDisplay'),
    sloanDataDisplayEnabled: alias('features.sloanDataDisplay'),
    sloanPreregDisplayEnabled: alias('features.sloanPreregDisplay'),

    hasCoi: computed('preprint.hasCoi', function() {
        return typeof this.preprint.get('hasCoi') === 'boolean';
    }),
    hasDataLinks: computed('preprint.hasDataLinks', function() {
        return typeof this.preprint.get('hasDataLinks') === 'string';
    }),
    hasPreregLinks: computed('preprint.hasPreregLinks', function() {
        return typeof this.preprint.get('hasPreregLinks') === 'string';
    }),
});

