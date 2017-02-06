import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Forbidden Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
});
