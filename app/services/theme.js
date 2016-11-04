import Ember from 'ember';

export default Ember.Service.extend({
    id: null,

    provider: null,

    isProvider: Ember.computed.bool('id'),

    stylesheet: Ember.computed('id', function() {
        return `/preprints/assets/css/${this.get('id').toLowerCase()}.css`;
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
