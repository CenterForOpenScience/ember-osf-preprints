import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays active preprint providers in a horizontal carousel with five providers per slide. Does not auto-advance.
 * Handles display on two pages: index (lightLogo=true) and discover (lightLogo=false).  If using elsewhere, need to add more customization
 * around how provider logos and links are built.
 *
 * Sample usage:
 * ```handlebars
 * {{provider-carousel
 *  providers=providers
}}
 * ```
 * @class provider-carousel
 */
export default Ember.Component.extend(Analytics, {
    providers: Ember.A(), // Pass in preprint providers
    itemsPerSlide: 5, // Default
    lightLogo: true, // Light logos by default, for Index page.
    numProviders: Ember.computed('providers', function() {
        return this.get('providers').length;
    }),
    numSlides: Ember.computed('numProviders', function() {
        return Math.ceil(this.get('numProviders')/this.get('itemsPerSlide'));
    }),
    slides: Ember.computed('numSlides', 'providers', function() {
        const numSlides = this.get('numSlides');
        const itemsPerSlide = this.get('itemsPerSlide');
        return new Array(numSlides).fill().map((_, i) => {
            return this.get('providers').slice(i * itemsPerSlide, i * itemsPerSlide + itemsPerSlide);
        });
    }),
    didInsertElement: function () {
        Ember.$('.carousel').carousel();
    }
});
