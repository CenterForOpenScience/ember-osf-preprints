import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        /* jshint unused: false */
        updatePreprint(preprintId, title, abstract, authors, subject, tags, journal) {
            this.get('store').findRecord('preprint', preprintId).then(preprint => {
                preprint.set('title', title);
                preprint.set('abstract', abstract);
                preprint.set('authors', authors);
                // preprint.set('subject', subject);
                //preprint.set('tags', tags);
                //preprint.set('journal', journal);
                console.log('done');
                preprint.save().then(this.transitionToRoute('preprints', preprintId));
            });
        }
    }
});
