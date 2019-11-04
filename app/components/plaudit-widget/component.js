import Component from '@ember/component';
import config from 'ember-get-config';

export default Component.extend({
    plauditWidgetUrl: config.plauditWidgetUrl,
});
