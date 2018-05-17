import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    theme: service(),
    classNames: ['preprint-header', 'preprint-header-error'],
    label: '',
    translationKey: '',
    supportEmail: computed('theme.{isProvider,provider.emailSupport}', function() {
        return this.get('theme.isProvider') ? this.get('theme.provider.emailSupport') : 'support@osf.io';
    }),
});
