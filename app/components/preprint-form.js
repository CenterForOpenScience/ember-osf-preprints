import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        makePost(title, abstract, authors, subject, journal, content, link, citation) {
            this.attrs.makePost(title, abstract, authors, subject, journal, content, link, citation);
        },
    createNode(title, abstract) {
//            var node = this.get('store').createRecord('node', {
//            title: title,
//            category: 'project',
//            description: description || null
//        });
//        node.save();
//        alert("Project " + title + " added");

        // TODO check if this works with proper permissions (will get 401 if not set properly)
        let toPost = this.get('store').createRecord('preprint', {
            id: 'test5',
            title: title,
            abstract: abstract
        });
//        toPost.save();
    }
    }
});
