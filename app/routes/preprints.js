import Ember from 'ember';

var dateCreated = new Date();

var meta = {
    title: 'The Linux Command Line',
    contributors: 'Zach Janicki',
    dateCreated: dateCreated,
    abstract: "This is a sample usage of the MFR on the preprint server. This document will teach you everything you would ever want to know about the linux command line. Enjoy!" +
        " From here on out this is just filler text to give a better sense of what the page layout may look like with a more real to life abstract length. Hopefully the scientists" +
        " who write these abstracts have more to day about their own topics than I do about the linux command line...",
    publisher: "Linus Torvalds",
    project: "http://localhost:5000/re58y/",
    supplementalMaterials: "NONE",
    figures: "NONE",
    License: "Mit License",
    link: 'http://localhost:7778/render?url=http://localhost:5000/sqdwh/?action=download%26mode=render',
};

export default Ember.Route.extend({
    model() {
        console.log(this.store.findAll('preprint'));
        //return this.store.findRecord('preprint', 1);
        return meta;
    }
});
