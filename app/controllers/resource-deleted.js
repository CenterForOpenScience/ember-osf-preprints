import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
});
