import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';
import config from '../config/environment';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    headTagsService: Ember.inject.service('head-tags'),
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        controller.set('node', this.get('node'));
        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
        });
        return this._super(...arguments);
    },
    actions: {
        error() {
            this.intermediateTransitionTo('page-not-found');
        }
    },
    afterModel(preprint) {
        return preprint.get('node').then(node => {
            this.set('node', node);

            const ogp = [
                ['fb:app_id', config.FB_APP_ID],
                ['og:title', node.get('title')],
                ['og:image', '//osf.io/static/img/circle_logo.png'],
                ['og:image:type', 'image/png'],
                ['og:url', window.location.href],
                ['og:description', node.get('description')],
                ['og:site_name', 'Open Science Framework'],
                ['og:type', 'article'],
                ['article:published_time', new Date(preprint.get('dateCreated')).toISOString()],
                ['article:modified_time', new Date(node.get('dateModified')).toISOString()]
            ];

            const tags = [
                ...preprint.get('subjects').map(subjectBlock => subjectBlock.map(subject => subject.text)),
                ...node.get('tags')
            ];

            for (let tag of tags)
                ogp.push(['article:tag', tag]);

            let contributors = Ember.A();

            loadAll(node, 'contributors', contributors).then(() => {
                contributors.forEach(contributor => {
                    ogp.push(
                        ['og:type', 'article:author'],
                        ['profile:first_name', contributor.get('users.givenName')],
                        ['profile:last_name', contributor.get('users.familyName')]
                    );
                });

                this.set('headTags', ogp.map(item => (
                    {
                        type: 'meta',
                        attrs: {
                            property: item[0],
                            content: item[1]
                        }
                    }
                )));

                this.get('headTagsService').collectHeadTags();
            });
        });

    }
});
