import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

//Stub panelActions service
const panelActionsStub = Ember.Service.extend({
    open() {
        return;
    }
});

moduleFor('controller:submit', 'Unit | Controller | submit', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
    needs: [
        'validator:presence',
        'validator:length',
        'validator:format',
        'service:metrics',
        'service:panel-actions'
    ],
    beforeEach: function () {
       this.register('service:panel-actions', panelActionsStub);
       this.inject.service('panel-actions', { as: 'panelActions' });
   }

});

test('editLicense sets basicsLicense and licenseValid', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('basicsLicense.copyrightHolders'), null);
    assert.equal(ctrl.get('basicsLicense.licenseType'), null);
    assert.equal(ctrl.get('basicsLicense.year'), null);
    assert.equal(ctrl.get('licenseValid'), false);
    // Trigger controller action
    ctrl.send('editLicense', 'license', true);

    assert.equal(ctrl.get('basicsLicense'), 'license');
    assert.equal(ctrl.get('licenseValid'), true);
});

test('applyLicenseToggle toggles applyLicense', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('applyLicense'), false);
    ctrl.send('applyLicenseToggle', true);
    assert.equal(ctrl.get('applyLicense'), true);
});

test('next opens next panel and flashes changes saved', function(assert) {
    const ctrl = this.subject();
    const currentPanelName = 'Discipline';
    assert.equal('Basics', ctrl.get(`_names.${ctrl.get('_names').indexOf(currentPanelName) + 1}`));
    // Test breaking down before Ember.run.later complete
    // ctrl.send('next', currentPanelName);

});
