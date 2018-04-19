import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import $ from 'jquery';
import Analytics from 'ember-osf/mixins/analytics';
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
 *      providers=providers
 *      lightLogo=true
 *}}
 * ```
 * @class provider-carousel
 */
export default Component.extend(Analytics, {
    _resizeListener: null,
    // Pass in preprint providers
    itemsPerSlide: 5,
    // Default
    lightLogo: true,
    selectable: false,
    // Not selectable by default
    activeProvider: undefined,
    lockedMessage: 'Locked',
    providers: A(), // Light logos by default, for Index page.
    editedProviders: computed('providers', function() {
        const newProviders = A();
        for (const provider of this.get('providers')) {
            if (provider && provider.get('id') !== 'livedata') {
                newProviders.pushObject(provider);
            }
        }
        return newProviders;
    }),
    numProviders: computed('editedProviders', function() {
        return this.get('editedProviders').length;
    }),
    numSlides: computed('numProviders', 'itemsPerSlide', function() {
        return Math.ceil(this.get('numProviders') / this.get('itemsPerSlide'));
    }),
    slides: computed('numSlides', 'editedProviders', 'itemsPerSlide', function() {
        const numSlides = this.get('numSlides');
        const itemsPerSlide = this.get('itemsPerSlide');
        return new Array(numSlides).fill().map((_, i) => this.get('editedProviders').slice(i * itemsPerSlide, (i * itemsPerSlide) + itemsPerSlide));
    }),
    columnOffset: computed('numProviders', 'itemsPerSlide', function() {
        // If only one slide of providers, center the provider logos by adding a column offset.
        let offset = 'col-sm-offset-1';
        if (this.get('selectable')) {
            offset = 'col-lg-offset-1 col-md-offset-2 col-sm-offset-2 col-xs-offset-3';
        }
        const numProviders = this.get('numProviders');
        if (numProviders <= this.get('itemsPerSlide')) {
            switch (numProviders) {
            case 1:
                offset = 'col-sm-offset-5';
                break;
            case 2:
                offset = 'col-sm-offset-4';
                break;
            case 3:
                offset = 'col-sm-offset-3';
                break;
            case 4:
                offset = 'col-sm-offset-2';
                break;
            case 5:
                offset = 'col-sm-offset-1';
                break;
            default:
            }
        }
        return offset;
    }),
    init() {
        // Set resize listener so number of providers per slide can be changed
        this._super(...arguments);
        this.set('originalItemsPerSlide', this.get('itemsPerSlide'));
        this.setSlideItems();
        this._resizeListener = run.bind(this, this.setSlideItems);
        $(window).on('resize', this._resizeListener);
    },
    didReceiveAttrs() {
        this.setSlideItems();
    },
    didInsertElement () {
        $('.carousel').carousel();
    },
    actions: {
        selectProvider(provider) {
            this.set('activeProvider', provider);
            this.attrs.selectAction(provider);
        },
    },
    setSlideItems() {
        if (this.get('selectable')) {
            if (window.innerWidth < 320) {
                this.set('itemsPerSlide', 1);
            } else if (window.innerWidth < 768) {
                this.set('itemsPerSlide', 2);
            } else if (window.innerWidth < 1200) {
                this.set('itemsPerSlide', 4);
            } else {
                this.set('itemsPerSlide', this.get('originalItemsPerSlide'));
            }
        // On xs screens, show one provider per slide. Otherwise, five.
        } else if (window.innerWidth < 768) {
            this.set('itemsPerSlide', 1);
        } else {
            this.set('itemsPerSlide', this.get('originalItemsPerSlide'));
        }
    },
    willDestroy() {
        // Unbinds _resizeListener
        if (this._resizeListener) {
            $(window).off('resize', this._resizeListener);
        }
    },
});
