import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    classNames: ['preprint-error-page'],
    label: '',
    translationKey: '',
    supportEmail: Ember.computed('theme.isProvider', 'theme.provider.emailSupport', function() {
        return this.get('theme.isProvider') ? this.get('theme.provider.emailSupport') : 'support@osf.io';
    })
});
