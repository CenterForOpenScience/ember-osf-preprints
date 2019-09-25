import Component from '@ember/component';
import { inject as service } from '@ember/service';
import config from 'ember-get-config'

export default Component.extend({
    plauditWidgetUrl: config.plauditWidgetUrl,
});
