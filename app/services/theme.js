import Ember from 'ember';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule services
 */

/**
 * Detects preprint provider and allows you to inject that provider's theme into parts of your application
 *
 * @class theme
 * @extends Ember.Service
 */
export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),

    id: config.PREPRINTS.defaultProvider,

    currentLocation: null,

    provider: Ember.computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        return this
            .get('store')
            .findRecord('preprint-provider', id);
    }),

    isProvider: Ember.computed('id', function() {
        const id = this.get('id');
        return id && id !== 'osf';
    }),

    stylesheet: Ember.computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `/preprints/assets/css/${id}${suffix}.css`;
    }),

    logoSharing: Ember.computed('id', function() {
        const id = this.get('id');

        const logo = config.PREPRINTS.providers
            .find(provider => provider.id === id)
            .logoSharing;

        logo.path = `/preprints${logo.path}`;

        return logo;
    }),

    signupUrl: Ember.computed('id', function() {
        const query = Ember.$.param({
            campaign: `${this.get('id')}-preprints`,
            next: window.location.href
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: Ember.computed('currentLocation', function() {
        return this.get('currentLocation');
    }),

    permissionLanguage: Ember.computed('id', function() {
        const id = this.get('id');

        return config.PREPRINTS.providers
            .find(provider => provider.id === id)
            .permissionLanguage;
    }),
});
