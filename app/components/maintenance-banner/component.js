import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Component.extend({
    classNames: [
        'alert',
        'alert-info',
        'alert-dismissible',
        'alert-maintenance'
    ],

    attributeBindings: [
        'hidden'
    ],

    hidden: 'true',

    maintenance: {
        start: new Date(),
        end: new Date(),
    },

    init() {
        this._super(...arguments);

        if (!sessionStorage.getItem('maintenance-dismissed')) {
            Ember.$.ajax({
                url: `${config.OSF.apiUrl}/v2/status/`,
                crossDomain: true
            })
                .then(({maintenance}) => {
                    if (maintenance) {
                        this.setProperties({
                            hidden: false,
                            maintenance
                        });
                    }
                });
        }
    },

    actions: {
        dismiss() {
            sessionStorage.setItem('maintenance-dismissed', true);
            this.set('hidden', true);
        }
    }
});
