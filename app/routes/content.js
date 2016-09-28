import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
        });
        return this._super(...arguments);
    },
    actions: {
        error(error, transition) {
            window.history.replaceState({}, 'preprints', 'preprints/' + transition.params.content.preprint_id);
            this.intermediateTransitionTo('page-not-found');
        }
    },
    afterModel(resolvedModel) {
        const ogp = [
            ['og:title', resolvedModel.get('title')],
            ['og:image', '//osf.io/static/img/circle_logo.png'],
            ['og:image:type', 'image/png'],
            ['og:url', window.location.href],
            ['og:description', resolvedModel.get('abstract')],
            ['og:site_name', 'Open Science Framework'],
            ['og:type', 'article']
        ];

        for (let tag of resolvedModel.get('tags'))
            ogp.push(['article:tag', tag]);

        const tags = ogp.map(item => {
            return {
                type: 'meta',
                attrs: {
                    property: item[0],
                    content: item[1]
                }
            }
        });

        this.set('headTags', tags);
    }
});
