import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'li',

    profileLink: function() {
        let ids = this.get('contributor.users.identifiers');

        for (let i = 0; i < ids.length; i++)
            if (ids[i].base_url.match(/^https?:\/\/(?:.*\.)osf\.io$/))
                    return ids[i].url;

        return false;
    }.property('contributor')

});
