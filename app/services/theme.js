import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Service.extend({
    id: null,

    provider: null,

    isProvider: Ember.computed('id', function() {
        return this.get('id') !== 'osf';
    }),

    stylesheet: Ember.computed('id', function() {
        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `/preprints/assets/css/${this.get('id').toLowerCase()}${suffix}.css`;
    }),
});
