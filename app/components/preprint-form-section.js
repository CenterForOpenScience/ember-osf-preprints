import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import CpPanelComponent from 'ember-collapsible-panel/components/cp-panel';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Extends Ember Collapsible Panel's CpPanelComponent.
 * Preprint-form-header and preprint-form-body components go inside.
 *
 * Sample usage:
 * ```handlebars
 * {{#preprint-form-section class="upload-section-block" allowOpen=false
 *   name='locationOfPreprint' open=false}}
 *    {{preprint-form-header}}
 *    {{#preprint-form-body}}
 *    {{/preprint-form-body}}
 * {{/preprint-form-section}}
 * ```
 * @class preprint-form-section
 * */

export default CpPanelComponent.extend(Analytics, {
    i18n: service(),

    tagName: 'section',
    classNames: ['preprint-form-section'],
    classNameBindings: ['addPreprintFormBlock:preprint-form-block'],
    animate: false,
    innerForm: false,
    /**
     * Prevent toggling into form section if file has not been uploaded
     * @property {boolean} allowOpen
     */
    allowOpen: false,

    /**
     * Track whether this panel has ever been opened
     * (eg to suppress validation indicators until page is viewed)
     * @property {boolean} hasOpened
     */
    hasOpened: false,

    /**
     * Does the user have permission to edit information inside this panel?
     * @property {boolean} canEdit
     */
    canEdit: true,
    /**
     * Should the preprint-form-block class be added to the form section?
     * Used for hiding preprint form sections for read contributors
     * @computed {boolean} addPreprintFormBlock
     */
    addPreprintFormBlock: computed('canEdit', 'innerForm', function() {
        return this.get('canEdit') && !(this.get('innerForm'));
    }),

    init() {
        this._super(...arguments);
        this.set('panelState.boundOpenState', this.get('open'));
    },
    didReceiveAttrs() {
        this._super(...arguments);
        if (this.get('denyOpenMessage') === undefined) {
            this.set('denyOpenMessage', this.get('i18n').t('submit.please_complete_upload'));
        }
    },
    didRender() {
        this._super(...arguments);
        // If the panel is opened in any way, set hasOpened to true
        if (this.get('isOpen')) {
            this.set('hasOpened', true);
        }
    },
    // Called when panel is toggled
    handleToggle() {
        // Prevent closing all views
        const isOpen = this.get('isOpen');
        if (!isOpen) {
            if (this.get('allowOpen')) {
                // Crude mechanism to prevent opening a panel if conditions are not met
                this.get('metrics')
                    .trackEvent({
                        category: 'div',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Click to edit, ${this.name} section`,
                    });
                this._super(...arguments);
            } else {
                this.sendAction('errorAction', this.denyOpenMessage); // eslint-disable-line ember/closure-actions
            }
        }
    },
});
