import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
    //TODO: Add error handling
    //TODO: Add changability of button text
    createPreprint(title, abstract, authors, subject, tags, journal) {
        var buttonAction = this.get('buttonAction');
        //Create some form of preprint
        buttonAction(title, abstract, authors, subject, tags, journal);
        },
    updatePreprint(title, abstract, authors, subject, tags, journal) {
        var buttonAction = this.get('buttonAction');
        var preprintId = this.get('id');
        buttonAction(preprintId, title, abstract, authors, subject, tags, journal);
        }
    }
});
