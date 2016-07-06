import Ember from 'ember';
import $ from 'jquery';
import config from 'ember-get-config';

export default Ember.Controller.extend({
    _url: null,
    openModal: false,
    resolve: null,
    latestFileName: null,
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },
    actions: {
        makePost: function(title, abstract, authors, subject, journal, content, link, citation) {
//            var formData = this.store.createRecord('preprint', {
//                title: title,
//                abstract: abstract,
//                authors: authors,
//                subject: subject,
//                journal: journal,
//                content: content,
//                link: link,
//                citation: citation,
//            });

            //formData.save();
        },

        preUpload(comp, drop, file) {
            //this.set('openModal', true);
            this.set('latestFileName', file.name);
            var promise =  new Ember.RSVP.Promise(resolve => {
                this.set('resolve', resolve);
            });
            return promise;
        },
        uploadPreprintFile(nid) {
            this.set('_url', config.OSF.waterbutlerUrl + 'file?path=/' + this.get('latestFileName') + '&nid=' + nid + '&provider=osfstorage');
            this.set('openModal', false);
            this.get('resolve')();
        },
        buildUrl() {
            return this.get('_url');
        },
    },
});
