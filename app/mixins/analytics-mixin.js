import Ember from 'ember';

export default Ember.Mixin.create({
    actions: {
        didTransition() {
            this._super(...arguments);
            if (ga) {
                let url = window.location.href;
                ga('send', 'pageview', {
                    'page': url,
                    'title': url
                });
            }
        }
    }
});
