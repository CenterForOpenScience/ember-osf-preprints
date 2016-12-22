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

// test('discardUploadChanges', function(assert) {
//     // TODO Cannot read property 'pagination' of null
//     this.inject.service('store');
//     let store = this.store;
//     Ember.run(() => {
//         let file = store.createRecord('file', {
//             'id': '12345'
//         });
//         let preprint = store.createRecord('preprint', {
//             'primaryFile': file
//         });
//         let node = store.createRecord('node', {
//             title: 'hello'
//         });
//         const ctrl = this.subject();
//         ctrl.set('model', preprint);
//         ctrl.set('node', node);
//         assert.equal(ctrl.get('file'), null);
//         assert.equal(ctrl.get('selectedFile'), null);
//         assert.equal(ctrl.get('nodeTitle'), null);
//         assert.equal(ctrl.get('titleValid'), null);
//         ctrl.send('discardUploadChanges');
//         assert.equal(ctrl.get('file'), null);
//         assert.equal(ctrl.get('selectedFile.id'), file.id);
//         assert.equal(ctrl.get('nodeTitle'), 'hello');
//         assert.equal(ctrl.get('titleValid'), true);
//     });
// });
//
// test('clearDownstreamFields in entire upload section', function(assert) {
//     // TODO Cannot read property 'pagination' of null
//
//     this.inject.service('store');
//     let store = this.store;
//     const ctrl = this.subject();
//     Ember.run(() => {
//         let node = store.createRecord('node', {
//             title: 'hello'
//         });
//         ctrl.set('node', node);
//         ctrl.set('selectedFile', 'Test file');
//         ctrl.set('file', 'file');
//         ctrl.set('convertOrCopy', 'copy');
//         ctrl.set('nodeTitle', 'Test title');
//         ctrl.send('clearDownstreamFields', 'allUpload');
//         assert.equal(ctrl.get('node'), null);
//         assert.equal(ctrl.get('selectedFile'), null);
//         assert.equal(ctrl.get('file'), null);
//         assert.equal(ctrl.get('convertOrCopy'), null);
//         assert.equal(ctrl.get('nodeTitle'), null);
//     });
// });
//
// test('discardBasics', function(assert) {
//     // TODO Cannot read property 'pagination' of null
//     assert.expect(4);
//     this.inject.service('store');
//     let store = this.store;
//     const ctrl = this.subject();
//     Ember.run(() => {
//         let node = store.createRecord('node', {
//             title: 'hello',
//             tags: ['first tag'],
//             description: 'The best abstract'
//         });
//
//         let preprint = store.createRecord('preprint', {
//             doi: '10.1234/test_doi',
//             licenseRecord: {
//                 'year': '2016',
//                 'copyright_holders': ['Amelia Earhart']
//             },
//             license: 'No License'
//         });
//
//         ctrl.set('node', node);
//         ctrl.set('model', preprint);
//         ctrl.set('basicsTags', ['second Tag']);
//         ctrl.set('basicsAbstract', 'Test abstract');
//         ctrl.set('basicsDOI', null);
//         ctrl.set('basicsLicense', 'Test license');
//         ctrl.send('discardBasics');
//         assert.equal(ctrl.get('basicsTags')[0], node.get('tags')[0]);
//         assert.equal(ctrl.get('basicsAbstract'), node.get('description'));
//         assert.equal(ctrl.get('basicsDOI'), preprint.get('doi'));
//         // TODO promise hasn't resolved so this is incorrect.
//         assert.equal(ctrl.get('basicsLicense.year'), preprint.get('licenseRecord.year'));
//     });
// });

test('stripDOI', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsDOI', ' https://dx.doi.org/10.1234/hello ');
    ctrl.send('stripDOI');
    assert.equal(ctrl.get('basicsDOI'), '10.1234/hello');
});

// test('saveBasics', function(assert) {
//     //TODO
// })

test('addTag', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsTags', ['firstTag', 'secondTag']);
    ctrl.send('addTag', 'thirdTag');
    assert.equal(ctrl.get('basicsTags').length, 3);
    assert.equal(ctrl.get('basicsTags')[2], 'thirdTag');
});

test('removeTag', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsTags', ['firstTag', 'secondTag']);
    ctrl.send('removeTag', 'secondTag');
    assert.equal(ctrl.get('basicsTags').length, 1);
    assert.equal(ctrl.get('basicsTags')[0], 'firstTag');
});

test('setSubjects', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('disciplineModifiedToggle'), false);
    assert.equal(ctrl.get('subjectsList').length, 0);
    ctrl.send('setSubjects', [['Test Subject Test Only']]);
    assert.equal(ctrl.get('disciplineModifiedToggle'), true);
    assert.equal(ctrl.get('subjectsList').length, 1);
});

// test('saveSubjects', function(assert) {
//     //TODO
// })

// test('findContributors', function(assert) {
//     //TODO
// })

// test('highlightSuccessOrFailure', function(assert) {
//     //TODO
// })

test('toggleSharePreprintModal', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('showModalSharePreprint'), false);
    ctrl.send('toggleSharePreprintModal');
    assert.equal(ctrl.get('showModalSharePreprint'), true);
})

// test('savePreprint', function(assert) {
//     //TODO
// })
