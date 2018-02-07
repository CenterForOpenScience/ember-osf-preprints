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
    i18n: Ember.inject.service(),
    toast: Ember.inject.service(),
    theme: Ember.inject.service(),
    preprintWord: Ember.inject.service(),
    init() {
        const ppWord = this.get('preprintWord');
        const documentType = ppWord.getPreprintWord();
        const i18n = this.get('i18n');

        let preprintWords = {};
        Object.keys(documentType).forEach(function(key1) {
            const entry = documentType[key1];
            Object.keys(entry).forEach(function(key2) {
                const word = entry[key2];
                preprintWords[`${word}`] = i18n.t(`documentType.${key1}.${key2}`);
            });
        });

        this.get('i18n').addGlobals({preprintWords: preprintWords});

        this._super(...arguments);
    },
});
