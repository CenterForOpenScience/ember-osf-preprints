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
    scrollTopValue: null,
    activate: function() {
        this._super();
        window.scrollTo(0, 0);
        this.set('scrollTopValue', Ember.$(window).scrollTop());
    }
});
