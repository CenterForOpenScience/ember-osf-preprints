import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),

    isDomain: false,

    id: config.PREPRINTS.provider,

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

    isSubRoute: Ember.computed('isProvider', 'isDomain', function() {
        return this.get('isProvider') && !this.get('isDomain');
    }),

    pathPrefix: Ember.computed('isProvider', 'isDomain', 'id', function() {
        let pathPrefix = '/';

        if (!this.get('isDomain')) {
            pathPrefix += 'preprints/';

            if (this.get('isProvider')) {
                pathPrefix += `${this.get('id')}/`;
            }
        }

        return pathPrefix;
    }),

    routePrefix: Ember.computed('isSubRoute', function() {
        return this.get('isSubRoute') ? 'provider.' : '';
    }),

    stylesheet: Ember.computed('id', function() {
        const id = this.get('id');

        if (!id)
            return;

        const prefix = this.get('isDomain') ? '' : '/preprints';
        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `${prefix}/assets/css/${id}${suffix}.css`;
    }),

    signupUrl: Ember.computed('id', function() {
        const query = Ember.$.param({
            campaign: `${this.get('id')}-preprints`,
            next: window.location.href
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: Ember.computed('isProvider', function() {
        return this.get('isProvider') ? window.location.href : null;
    }),
});
