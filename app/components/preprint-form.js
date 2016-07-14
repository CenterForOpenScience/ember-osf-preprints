import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        //TODO: Add error handling
        //TODO: Add changability of button text
        createPreprint(title, abstract, authors, tags, journal) {
            let buttonAction = this.get('buttonAction'),
                subject = this.$('select[name=subject]').val();
            buttonAction(title, abstract, authors, subject, tags, journal);
        },
        updatePreprint(title, abstract, authors, tags, journal) {
            let buttonAction = this.get('buttonAction'),
                preprintId = this.get('id'),
                subject = this.$('select[name=subject]').val();
            buttonAction(preprintId, title, abstract, authors, subject, tags, journal);
            }
        }
});
