import Ember from 'ember';

export default Ember.Mixin.create({
    actions: {
        didTransition() {
            this._super(...arguments);
            if (ga) {  // jshint ignore: line
                let url = window.location.href;
                ga('send', 'pageview', {  // jshint ignore: line
                    page: url,
                    title: url
                });
            }
        }
    }
});
