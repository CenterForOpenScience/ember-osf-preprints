import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    classNames: ['branded-footer']
});
