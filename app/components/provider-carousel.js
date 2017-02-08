import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays active preprint providers in a horizontal carousel with five providers per slide. Does not auto-advance.
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
    })
});
