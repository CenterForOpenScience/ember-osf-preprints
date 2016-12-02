import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'li',
    contributor: null,

    profileLink: Ember.computed('contributor', function() {
        let ids = this.get('contributor.users.identifiers');

        for (let i = 0; i < ids.length; i++)
            if (ids[i].match(/^https?:\/\/(?:.*\.)osf\.io/))
                    return ids[i];

        return false;
    })
});
