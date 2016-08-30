import Ember from 'ember';

export default Ember.Component.extend({
    providerUrlRegex: {
        //'bioRxiv': '', doesnt currently have urls
        'Cognitive Sciences ePrint Archive': 'cogprints',
        OSF: 'osf',
        PeerJ: 'peerj',
        arXiv: 'arxiv'
    },
    didRender() {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub]);  // jshint ignore:line
    },
    numMaxChars: 300,
    showBody: false,
    footerIcon: Ember.computed('showBody', function() {
        return this.get('showBody') ? 'caret-up' : 'caret-down';
    }),
    result: null,

    shortDescription: Ember.computed('result', function() {
        let result = this.get('result');
        if (result.description && result.description.length > this.numMaxChars) {
            return result.description.substring(0, this.numMaxChars) + '...';
        }
        return result.description;
    }),

    osfID: function() {
        let re = /osf.io\/(\w+)\/$/;
        if (this.get('result.osfProvider'))
            for (let i = 0; i < this.get('result.lists.links.length'); i++)
                if (re.test(this.get('result.lists.links')[i].url))
                    return re.exec(this.get('result.lists.links')[i].url)[1];
        return false;
    }.property('result'),

    hyperlink: function() {
        var rule = this.get('providerUrlRegex')[this.get('result.providers.0.name')];
        var matches = [];
        if (rule) {
            matches = this.get('result.lists.links').slice().filter(each => each.url.indexOf(rule) !== -1);
        }
        return matches.length ? matches[0].url : this.get('result.lists.links.0.url');
    }.property('result'),

    actions: {
        toggleShowBody() {
            this.set('showBody', !this.showBody);
        },
        select(item) {
            this.attrs.select(item);
        }
    }

});
