import { merge } from '@ember/polyfills';
import I18nService from 'ember-i18n/services/i18n';

export default I18nService.extend({
    _globals: {},

    t(key, data = {}) {
        const mutableData = merge(this.get('_globals'), data);
        return this._super(key, mutableData);
    },
    addGlobals(globals) {
        this.set('_globals', merge(this.get('_globals'), globals));
    },
});
