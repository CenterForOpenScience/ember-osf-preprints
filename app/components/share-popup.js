import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    didInsertElement: function () {
        $('#share-popover').popover();
    },});
