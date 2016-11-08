import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Service.extend({
    id: null,

    provider: null,

    isProvider: Ember.computed.bool('id'),

    stylesheet: Ember.computed('id', function() {
        const suffix = config.ASSET_SUFFIX ? `-${config.ASSET_SUFFIX}` : '';
        return `/preprints/assets/css/${this.get('id').toLowerCase()}${suffix}.css`;
    }),

    flatSubjects: Ember.computed('provider.subjectsAcceptable', function() {
        const acceptableSubjects = this.get('provider.subjectsAcceptable') || [];
        const flatSubjects = new Set();

        for (const subjects of acceptableSubjects) {
            for (const subject of subjects[0]) {
                if (!flatSubjects.has(subject))
                    flatSubjects.add(subject);
            }
        }

        return flatSubjects;
    }),
});
