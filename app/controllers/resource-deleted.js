import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Resource Deleted Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
});
