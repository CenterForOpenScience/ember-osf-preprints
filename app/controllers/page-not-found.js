import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Page Not Found Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
});
