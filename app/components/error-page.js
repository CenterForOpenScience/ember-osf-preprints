import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    classNames: ['preprint-header', 'preprint-header-error'],
    label: '',
    translationKey: '',
    supportEmail: Ember.computed('theme.isProvider', 'theme.provider.emailSupport', function() {
        return this.get('theme.isProvider') ? this.get('theme.provider.emailSupport') : 'support@osf.io';
    })
});
