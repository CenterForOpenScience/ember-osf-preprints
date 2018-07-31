import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

/**
* @module ember-osf-preprints
* @submodule components
*/

/**
* Widget to select a license on a project or preprint with the ability
* to only allow a subset of licenses and to autosave or save explictly
* ```handlebars
* {{license-picker
*   licenses=availableLicenses
*   year=model.licenseRecord.year
*   copyrightHolders=model.licenseRecord.copyrightHolders}}
* ```
* @class license-picker
* @param {DS.Model} licenses Which Licenses are available to be selected
* @param {string} year The year of the license
* @param {string} copyrightHolders The copyright holders joined as a string
*/
export default Component.extend({
    i18n: service(),

    showText: false,

    toggleText: computed.notEmpty('license.text'),

    selectedLicenseText: computed('license.text', 'year', 'copyrightHolders', function() {
        let text = this.get('license.text');
        if (text) {
            text = text.replace(/({{year}})/g, this.get('year') || '');
            text = text.replace(/({{copyrightHolders}})/g, this.get('copyrightHolders') || '');
        }
        return text;
    }),

    yearRequired: computed('license.requiredFields', function() {
        return this.get('license.requiredFields') && this.get('license.requiredFields').includes('year');
    }),

    copyrightHoldersRequired: computed('license.requiredFields', function() {
        return this.get('license.requiredFields') && this.get('license.requiredFields').includes('copyrightHolders');
    }),

    showYear: computed('license.text', function() {
        const licenseText = this.get('license.text') || '';
        return licenseText.includes('{{year}}');
    }),

    showCopyrightHolders: computed('license.text', function() {
        const licenseText = this.get('license.text') || '';
        return licenseText.includes('{{copyrightHolders}}');
    }),

    actions: {
        selectLicense(licenseID) {
            const license = this.get('licenses').filter(license => license.id === licenseID)[0];
            this.set('license', license);
        },

        toggleFullText() {
            this.set('showText', !this.get('showText'));
        },
    },
});
