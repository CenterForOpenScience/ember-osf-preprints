import Ember from 'ember';
import config from 'ember-get-config';

const levelMap = {
    1: 'info',
    2: 'warning',
    3: 'danger'
};

export default Ember.Component.extend({
    classNames: ['alert', 'alert-dismissible', 'alert-maintenance'],
    classNameBindings: ['alertClass'],

    attributeBindings: [
        'hidden'
    ],

    hidden: 'true',

    alertClass: 'alert-info',

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
                        this.set('alertClass', `alert-${levelMap[maintenance.level] || 'info'}`);
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
