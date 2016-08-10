import Ember from 'ember';
import Validations from '../validators/preprint-form-validator';

export default Ember.Route.extend(Validations, {
    model() {
        return this;
    }

});
