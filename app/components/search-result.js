import Ember from 'ember';

export default Ember.Component.extend({
    providerUrlRegex: {
        //'bioRxiv': '', doesnt currently have urls
        Cogprints: /cogprints/,
        OSF: /https?:\/\/((?!api).)*osf.io/, // Doesn't match api.osf urls
        PeerJ: /peerj/,
        arXiv: /arxivj/
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
        // NOTE / TODO : This will have to be removed later. Currently the only "true" preprints are solely from the OSF
        // socarxiv and the like sometimes get picked up by as part of OSF, which is technically true. This will prevent
        // broken links to things that aren't really preprints.
        if (this.get('result.providers.length') === 1 && this.get('result.providers').find(provider => provider.name === 'OSF'))
            for (let i = 0; i < this.get('result.lists.links.length'); i++)
                if (re.test(this.get('result.lists.links')[i].url))
                    return re.exec(this.get('result.lists.links')[i].url)[1];
        return false;
    }.property('result'),

    hyperlink: function() {
        var re = null;
        for (let i = 0; i < this.get('result.providers.length'); i++)
            re = this.providerUrlRegex[this.get('result.providers')[i].name] || null;

        if (!re) return this.get('result.lists.links.0.url');

        for (let j = 0; j < this.get('result.lists.links.length'); j++)
            if (re.test(this.get('result.lists.links')[j].url))
                return this.get('result.lists.links')[j].url;

        return this.get('result.lists.links.0.url');
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
