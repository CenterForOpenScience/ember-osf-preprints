import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {
    // Ember controllers are singletons; provide a method that can be called by `route#setupController` in each page view

    setupController(controller, model) {
        controller.manualResetController();
        this._super(controller, model);
    }
});

