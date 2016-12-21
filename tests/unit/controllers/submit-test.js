import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

//Stub panelActions service
const panelActionsStub = Ember.Service.extend({
    open() {
        return;
    },
    toggle(name) {
        const panel = panels[name];
        return panel.get('isOpen') ? panel.set('isOpen', false) : panel.set('isOpen', true);
    }
});

let panels = Ember.Object.create({
    'Discipline': Ember.Object.create({'isOpen': true}), 'Basics': Ember.Object.create({'isOpen': false})
});

moduleFor('controller:submit', 'Unit | Controller | submit', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
    needs: [
        'validator:presence',
        'validator:length',
        'validator:format',
        'service:metrics',
        'service:panel-actions',
        'model:file',
        'model:file-version',
        'model:comment',
        'model:node',
        'model:preprint',
        'model:preprint-provider',
        'model:institution',
        'model:contributor',
        'model:file-provider',
        'model:registration',
        'model:draft-registration',
        'model:log'
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

test('next opens next panel and flashes changes saved', function(assert) {
    const ctrl = this.subject();
    const currentPanelName = 'Discipline';
    assert.equal('Basics', ctrl.get(`_names.${ctrl.get('_names').indexOf(currentPanelName) + 1}`));
    // TODO Test breaking down before setTimeout  complete
    // ctrl.send('next', currentPanelName);
});

test('nextUploadSection closes current panel and opens next panel', function(assert) {
    // TODO not really testing anything except the stub
    const ctrl = this.subject();
    panels = Ember.Object.create({
        'Discipline': Ember.Object.create({'isOpen': true}), 'Basics': Ember.Object.create({'isOpen': false})
    });
    ctrl.send('nextUploadSection', 'Discipline', 'Basics');
    assert.equal(panels.get('Discipline.isOpen'), false);
    assert.equal(panels.get('Basics.isOpen'), true);

});

// test('changesSaved temporarily changes currentPanelSaveState to true', function(assert) {
//     // TODO
// });

// test('error', function(assert) {
//     //TODO
// })

// test('changeInitialState', function(assert) {
//     //TODO
// })

test('lockNode', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('nodeLocked'), false);
    ctrl.send('lockNode');
    assert.equal(ctrl.get('nodeLocked'), true);
});

// test('finishUpload', function(assert) {
//     //TODO
// })

// test('existingNodeExistingFile', function(assert) {
//     //TODO
// })

// test('createComponentCopyFile', function(assert) {
//     //TODO
// })

// test('resumeAbandonedPreprint', function(assert) {
//     //TODO
// })

// test('startPreprint', function(assert) {
//     //TODO
// })

test('selectExistingFile', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('selectedFile'), null);
    ctrl.send('selectExistingFile', 'my-file.jpg');
    assert.equal(ctrl.get('selectedFile'), 'my-file.jpg');
});

test('discardUploadChanges', function(assert) {
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let file = store.createRecord('file', {
            'id': '12345'
        });
        let preprint = store.createRecord('preprint', {
            'primaryFile': file
        });
        let node = store.createRecord('node', {
            title: 'hello'
        });
        const ctrl = this.subject();
        ctrl.set('model', preprint);
        ctrl.set('node', node);
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('selectedFile'), null);
        assert.equal(ctrl.get('nodeTitle'), null);
        assert.equal(ctrl.get('titleValid'), null);
        ctrl.send('discardUploadChanges');
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('selectedFile.id'), file.id);
        assert.equal(ctrl.get('nodeTitle'), 'hello');
        assert.equal(ctrl.get('titleValid'), true);
    });
});
