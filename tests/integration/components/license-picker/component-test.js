import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';


moduleForComponent('license-picker', 'Integration | Component | license picker', {
    integration: true
});

function render(ctx, args) {
    ctx.set('currentValues', {});
    ctx.set('noop', () => {});
    ctx.set('licenses', [{
        name: 'Without',
        text: 'This is a license without input fields',
        requiredFields: []
    }, {
        name: 'No license',
        text: '{{yearRequired}} {{copyrightHolders}}',
        required_fields: ['yearRequired', 'copyrightHolders']
    }]);
    return ctx.render(Ember.HTMLBars.compile(`{{license-picker
        ${args && args.indexOf('editLicense') === -1 ? 'editLicense=(action noop)' : ''}
        allowDismiss=false
        licenses=licenses
        currentValues=currentValues
        pressSubmit=(action noop)
        ${args || ''}
    }}`));
}

test('it renders', function(assert) {
    render(this);
    assert.ok(true);
});
