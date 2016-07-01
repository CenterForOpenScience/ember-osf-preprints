import Ember from 'ember';
import $ from 'jquery';
var Dropzone = window.Dropzone;

export default Ember.Controller.extend({
    showMFR: false,
    actions: {
        makePost: function(title, abstract, authors, subject, journal, content, link, citation) {
            console.log("made it");

            var data = {
                title: title,
                abstract: abstract,
                authors: authors,
                subject: subject,
                journal: journal,
                content: content,
                link: link,
                citation: citation,
            };
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
            console.log(data);
            //formData.save();
        },
        switchToMFR(){
            console.log("Well this happened");
            this.toggleProperty('showMFR');
        },
        addedFileEvent: Ember.computed(function() {
            return function() {
            console.log("Well this happened");
                this.toggleProperty('showMFR');
            };
          }),


        uploadPreprint: function() {

        }
    },
    init() {
    Dropzone.autoDiscover = true;
        // Don't show dropped content if user drags outside dropzone
        window.ondragover = function(e) { e.preventDefault(); };
        window.ondrop = function(e) { e.preventDefault(); };

        Dropzone.options.preprintDropzone = {
            accept: function(file, done) {
                if (file.name === "ir-chap01.pdf") {
                    alert("found it!");
                }
            },
                sending: function (file, xhr) {
                //Hack to remove webkitheaders
                var _send = xhr.send;
                xhr.send = function () {
                    _send.call(xhr, file);
                };
                },
            clickable: '#preprintDropzone'
        };
    }
});
