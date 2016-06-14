import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true,
            refreshModel: true
        },
        subjectID: {
            replace: true
        }
    },

    model() {
        return Ember.RSVP.hash({
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject')
        });
    },
    actions: {
        filter: function(s) {
            if ( s ) {
                this.transitionTo( {queryParams: { subject: s.get('subject'), subjectID: s.get('subjectid') } } );
                this.refresh();
            } else {
                this.transitionTo( {queryParams: { subject: null, subjectID: null } } );
            }
        }
    }
});


