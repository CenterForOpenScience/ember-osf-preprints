import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias, or } from '@ember/object/computed';

export default Component.extend({
    features: service(),

    preprint: null,
    provider: alias('preprint.provider'),
    documentType: alias('provider.documentType'),

    shouldShowSloanIcons: alias('hasSloanData'),
    hasSloanData: or('hasCoi', 'hasDataLinks', 'hasPreregLinks'),

    shouldShowCoi: alias('hasCoi'),
    shouldShowDataLinks: alias('hasDataLinks'),
    shouldShowPreregLinks: alias('hasPreregLinks'),

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

