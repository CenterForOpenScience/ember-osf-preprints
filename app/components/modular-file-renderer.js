import Ember from 'ember';
//import mfr from '/Users/zachjanicki/Developer/COS/modular-file-renderer/mfr/server/static/js/mfr.js';

var url = 'http://localhost:7778/';
var mfr_source = 'static/js/mfr.js';
var link = 'http://localhost:7778/render?url=http://localhost:5000/53hvx/?action=download%26mode=render';

//var mfrRender = new mfr.Render("mfrIframe", link);
var dateCreated = new Date();

export default Ember.Component.extend({
    title: 'The Linux Command Line',
    contributors: 'Zach Janicki',
    dateCreated: dateCreated,
    abstract: "This is a sample usage of the MFR on the preprint server. This document will teach you everything you would ever want to know about the linux command line. Enjoy!",
    publisher: "Linus Torvalds",
    project: "http://localhost:5000/re58y/",
    supplementalMaterials: "NONE",
    figures: "NONE",
    License: "Mit License",
    link: 'http://localhost:7778/render?url=http://localhost:5000/sqdwh/?action=download%26mode=render',
});
