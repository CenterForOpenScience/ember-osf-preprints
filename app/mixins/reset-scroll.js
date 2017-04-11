import Ember from 'ember';

/**
 * @module ember-preprints
 * @submodule mixins
 */

/**
 * When scrolled down the page and navigating to another route in the application, the template loads scrolled down the same amount
 * as on the previous page.  This mixin scrolls back to the top on every new route.
 *
 * @class ResetScrollMixin
 */
export default Ember.Mixin.create({
    scrollTarget: window,
    activate: function() {
        this._super();
        return this.get('scrollTarget').scrollTo(0, 0);
    }
});
