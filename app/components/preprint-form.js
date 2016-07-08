import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {

    //TODO: Add error handling
    createNode(title, abstract) {

        //Create new public project
        var node = this.get('store').createRecord('node', {
            title: title,
            category: 'project',
            description: abstract || null,
            public: true
        });

        //TODO: Add logic for if you're not uploading a file
        //Upload a new file to the new project
        node.save().then(() => this.get('uploadFile')(node.id));

        //Save metadata in Jam
        //TODO:Link all of these calls together so that you can have a GUID before creating metadata
        // TODO check if this works with proper permissions (will get 401 if not set properly)
        // TODO: Change serializers so that this request is formed correctly

        let preprintMetadata = this.get('store').createRecord('preprint', {
            "id": "h43fd",
            "attributes": {
                "title": title,
                "abstract": abstract
            }
        });

        preprintMetadata.save();

//        this.transitionTo('/');
    }
        //TODO: eventually make a call to set an OSF file as a preprint (will probably need a flag for such)
    }
});
