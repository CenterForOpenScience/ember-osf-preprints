import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        makePost(title, abstract, authors, subject, journal, content, link, citation) {
            this.attrs.makePost(title, abstract, authors, subject, journal, content, link, citation);
        },
    createNode(title, description) {
            var node = this.get('store').createRecord('node', {
            title: title,
            category: 'project',
            description: description || null
        });
        node.save();
        alert("Project " + title + " added");
    }
    }
});
