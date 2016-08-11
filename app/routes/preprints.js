import Ember from 'ember';
import config from 'ember-get-config';

//TODO: Remove RSVP hash - use setupController to get supplement
export default Ember.Route.extend({
    model(params) {
        let node = this.store.findRecord('preprint', params.file_id);
        let fileList = this.getFiles(node);
        return Ember.RSVP.hash({
            preprint: node,
            fileList: this.getFiles(node),
            primary: fileList.then(files => files.get('firstObject')), //This should come directly from the preprint object in the future
        });
    },
    getFiles(node) {
        return node.then(
        node => node.query(
        'files', { 'filter[name]': 'osfstorage' }
            ).then(
                providers => {
                    var provider = providers.get('firstObject');
                    if (provider) {
                        return provider.get('files');
                    }
                }
            )
        );
    },
});

