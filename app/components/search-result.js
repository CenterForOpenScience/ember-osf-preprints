import Ember from 'ember';

export default Ember.Component.extend({
    providerUrlRegex: {
        //'bioRxiv': '', doesnt currently have urls
        Cogprints: /cogprints/,
        OSF: /https?:\/\/((?!api).)*osf.io/, // Doesn't match api.osf urls
        PeerJ: /peerj/,
        arXiv: /arxivj/
    },
    didRender() {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$()[0]]);  // jshint ignore:line
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
        return result.description.slice();
    }),

    osfID: Ember.computed('result', function() {
        let re = /osf.io\/(\w+)\/$/;
        if (this.get('result.providers').find(provider => provider.name === 'OSF'))
            for (let i = 0; i < this.get('result.lists.links.length'); i++)
                if (re.test(this.get('result.lists.links')[i].url))
                    return re.exec(this.get('result.lists.links')[i].url)[1];
        return false;
    }),

    hyperlink: Ember.computed('result', function() {
        var re = null;
        for (let i = 0; i < this.get('result.providers.length'); i++)
            re = this.providerUrlRegex[this.get('result.providers')[i].name] || null;

        if (!re) return this.get('result.lists.links.0.url');

        for (let j = 0; j < this.get('result.lists.links.length'); j++)
            if (re.test(this.get('result.lists.links')[j].url))
                return this.get('result.lists.links')[j].url;

        return this.get('result.lists.links.0.url');
    }),

    actions: {
        toggleShowBody() {
            this.set('showBody', !this.showBody);
        },
        select(item) {
            this.attrs.select(item);
        }
    }

});
