import Ember from 'ember';

export default Ember.Mixin.create({
    // valid: false,   // Override with computed property
    // _restoreAttrs: Ember.on('didReceiveAttrs', function() {
    //     const state = this.get('restoreState').get(this.get('name'));
    //     if (state) {
    //         for (let attr of Object.keys(state)) {
    //             this.set(attr, state.get('attr'));
    //         }
    //     }
    // }),
    // _saveAttrs: Ember.on('willDestroyElement', function() {
    //     if (this.get('saveProperties')) {
    //         this.sendAction('saveProperties', this.get('saveProperties').map(el => [el, this.get(el)]));
    //     }
    // }),
    _verify: function() {
        this.get('verify')(this.get('valid'));
    }.observes('valid').on('init') // Requires .on('init') to start observing without getting the value
});
