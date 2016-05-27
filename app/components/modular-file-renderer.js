import Ember from 'ember';
//import mfr from '/Users/zachjanicki/Developer/COS/modular-file-renderer/mfr/server/static/js/mfr.js';

var url = 'http://localhost:7778/';
var mfr_source = 'static/js/mfr.js';
var link = 'http://localhost:7778/render?url=http://localhost:5000/53hvx/?action=download%26mode=render';

//var mfrRender = new mfr.Render("mfrIframe", link);

export default Ember.Component.extend({
    url: 'http://localhost:7778/',
    mfr_source: 'static/js/mfr.js',
    link: 'http://localhost:7778/render?url=http://localhost:5000/sqdwh/?action=download%26mode=render',
});
