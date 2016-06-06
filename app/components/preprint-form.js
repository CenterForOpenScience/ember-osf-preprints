import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        makePost(title, abstract, authors, subject, journal, content, link, citation) {
            this.attrs.makePost(title, abstract, authors, subject, journal, content, link, citation);
        }
    },
});
