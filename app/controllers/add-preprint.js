import Ember from 'ember';
import $ from 'jquery';
import config from 'ember-get-config';

//TODO: Store all dates the same and use a helper or addon to format
var getTagDate = function(){
    var date = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[date.getMonth()];
    var year = date.getFullYear();

    return `${month} ${year}`;
}


export default Ember.Controller.extend({
    toast: Ember.inject.service(),
    _url: null,
    openModal: false,
    resolve: null,
    latestFileName: null,
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },
    actions: {
        preUpload(comp, drop, file) {
            this.set('latestFileName', file.name);
            var promise =  new Ember.RSVP.Promise(resolve => {
                this.set('resolve', resolve);
            });
            return promise;
        },
        buildUrl() {
            return this.get('_url');
        },
        //TODO: Break up this logic into three functions (project, file, save metadata)
        uploadNewPreprintToNewProject(title, abstract, authors, subject, tags, journal) {
        //Create new public project
            var node = this.get('store').createRecord('node', {
                title: title,
                category: 'project',
                description: abstract || null,
                public: true
            });

            //TODO: Add logic for if you're not uploading a file
            //Upload a new file to the new project
            node.save().then(() => {
                this.set('_url', 'https://test-files.osf.io/' + 'file?path=/' + this.get('latestFileName') + '&nid=' + node.id + '&provider=osfstorage');
                this.set('openModal', false);
                this.get('resolve')();
                });

            //Save metadata in Jam
            //TODO:Link all of these calls together so that you can have a GUID before creating metadata
            // TODO check if this works with proper permissions (will get 401 if not set properly)
            // TODO: Change serializers so that this request is formed correctly

            let preprintMetadata = this.get('store').createRecord('preprint', {
                "id": "rmvnx",
                "attributes": {
                    "title": title,
                    "abstract": abstract
                }
            });

            preprintMetadata.save();

            //this.get('toast').error("Toast is trying man");
            //this.transitionToRoute('/');

    //TODO: eventually make a call to set an OSF file as a preprint (will probably need a flag for such)
    }

    },
});
