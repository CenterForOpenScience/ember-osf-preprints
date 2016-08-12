import Ember from 'ember';

export default Ember.Route.extend({
    model() {
        return this.modelFor('preprints');
    },
    setupController(controller, model) {
        this.getFiles(model).then(files => controller.set('fileList', files));
        this._super(...arguments);
    },
    getFiles(node) {
    //TODO: Make supplement scrolling based on pagination
        return node.query(
        'files', { 'filter[name]': 'osfstorage' }
        ).then(
            providers => {
                var provider = providers.get('firstObject');
                if (provider) {
                    return provider.query('files', { 'page[size]': 100 });
                }
            }
        );
    }
});

