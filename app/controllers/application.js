import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Application Controller
 * @extends Ember-OSF.OSFAgnosticAuthControllerMixin
 */
export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),
    theme: Ember.inject.service(),
});
