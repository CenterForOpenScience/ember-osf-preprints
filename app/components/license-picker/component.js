import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

/**
* @module ember-osf
* @submodule components
*/

/**
* Widget to select a license on a project or preprint with the ability
* to only allow a subset of licenses and to autosave or save explictly
* ```handlebars
* {{license-picker
*   licenses=availableLicenses
*   currentValues=basicsLicense
*   showCategories=false
*   editLicense=(action 'editLicense')
*   pressSubmit=(action 'saveBasics')}}
* ```
* @class license-picker
* @param {DS.Model} licenses Which Licenses are available to be selected
* @param {Object} currentValues The values that are currently on the model, as strings (copyrightHolders joined as a string)
* @param {boolean} showCategories whether the licenses available in the dropdown are separated by categories
* @param {action} editLicense function to be called when the license details are changed (either on submit or autosaving)
* @param {action} pressSubmit what should be called if Enter is pressed
*/
export default Component.extend({
    store: service(),
    i18n: service(),

    showBorder: true,
    showYear: true,
    showText: false,
    toggleText: true,
    showCopyrightHolders: true,
    showCategories: true,
    allowDismiss: false,
    year: null,
    copyrightHolders: null,

    licensesAvailable: A(),

    _setNodeLicense: computed('licensesAvailable', 'currentValues.licenseType', function() {
        if (!this.get('currentValues.licenseType.id')) { // if not resolved properly
            this.set('nodeLicense', this.get('licensesAvailable.firstObject'));
        } else {
            this.set('nodeLicense', this.get('currentValues.licenseType'));
        }
    }),

    nodeLicenseText: computed('nodeLicense', 'nodeLicense.text', 'year', 'copyrightHolders', function() {
        let text = this.get('nodeLicense.text');
        if (text) {
            text = text.replace(/({{year}})/g, this.get('year') || '');
            text = text.replace(/({{copyrightHolders}})/g, this.get('copyrightHolders') || '');
        }
        return text;
    }),

    yearRequired: computed('nodeLicense', function() {
        return this.get('nodeLicense.requiredFields') && this.get('nodeLicense.requiredFields').indexOf('year') !== -1;
    }),

    copyrightHoldersRequired: computed('nodeLicense', function() {
        return this.get('nodeLicense.requiredFields') && this.get('nodeLicense.requiredFields').indexOf('copyrightHolders') !== -1;
    }),

    // licenseEdited: computed('copyrightHolders', 'nodeLicense', 'year', function() {
    //     Ember.run.debounce(this, function() {
    //         if (this.get('autosave')) {
    //             this.get('actions.save').bind(this)();
    //         }
    //     }, 250);
    // }),

    showOtherFields: computed('nodeLicense', 'nodeLicense.text', function() {
        const text = this.get('nodeLicense.text');
        if (!text) {
            return;
        }
        this.set('showYear', text.indexOf('{{year}}') !== -1);
        this.set('showCopyrightHolders', text.indexOf('{{copyrightHolders}}') !== -1);
    }),

    didReceiveAttrs() {
        if (!this.get('licenses')) {
            this.get('store').query('license', { 'page[size]': 20 }).then(ret => {
                this.set('licensesAvailable', ret);
            });
        } else {
            this.set('licensesAvailable', this.get('licenses'));
        }
        if (!this.get('currentValues.year')) {
            const date = new Date();
            this.set('year', String(date.getUTCFullYear()));
        } else {
            this.set('year', this.get('currentValues.year'));
        }
        if (this.get('currentValues.copyrightHolders')) {
            this.set('copyrightHolders', this.get('currentValues.copyrightHolders'));
        }
    },

    actions: {
        selectLicense(license) {
            this.set('nodeLicense', license);
        },
        toggleFullText() {
            this.set('showText', !this.get('showText'));
        },
        save() {
            const values = {
                licenseType: this.get('nodeLicense'),
                year: this.get('year'),
                copyrightHolders: this.get('copyrightHolders') ? this.get('copyrightHolders') : '',
            };
            this.attrs.editLicense(
                values,
                !((this.get('yearRequired') && !values.year) || (this.get('copyrightHoldersRequired') && values.copyrightHolders.length === 0)),
            );
        },
    },
});
