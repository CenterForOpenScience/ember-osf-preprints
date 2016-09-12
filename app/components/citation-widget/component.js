import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Component.extend({
    apa: '',
    mla: '',
    chicago: '',
    didReceiveAttrs() {
        this._super(...arguments);
        let url = config.apiUrl + 'nodes/' + this.get('nodeId') + '/citation/';
        Ember.$.ajax({
            type: 'GET',
            url: url + 'apa/',
            contentType: 'application/json',
            crossDomain: true,
        }).then(result => this.set('apa', result.data.attributes.citation));
        Ember.$.ajax({
            type: 'GET',
            url: url + 'modern-language-association/',
            contentType: 'application/json',
            crossDomain: true,
        }).then(result => this.set('mla', result.data.attributes.citation));
        Ember.$.ajax({
            type: 'GET',
            url: url + 'chicago-author-date/',
            contentType: 'application/json',
            crossDomain: true,
        }).then(result => this.set('chicago', result.data.attributes.citation));
    }
});
