import Ember from 'ember';
import config from 'ember-get-config';

var levelMap = {
    1: 'info',
    2: 'warning',
    3: 'danger'
};

export default Ember.Component.extend({
    classNamesBindings: [
        'alert',
        '_info:alertInfo',
        '_warning:alertWarning',
        '_danger:alertDanger'
    ],

    attributeBindings: [
        'hidden'
    ],

    hidden: 'true',

    alert: true,
    _info: true,
    _warning: false,
    _danger: false,

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
                        this.set('_info', false);
                        this.set(`_${levelMap[maintenance.level]}`, true);
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
