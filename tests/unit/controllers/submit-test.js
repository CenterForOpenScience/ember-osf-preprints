import { moduleFor, test, skip } from 'ember-qunit';
import Ember from 'ember';
// import wait from 'ember-test-helpers/wait';

//Stub panelActions service
const panelActionsStub = Ember.Service.extend({
    open(name) {
        const panel = panels[name];
        panel.set('isOpen', true);
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
        'service:toast',
        'service:i18n',
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
        'model:log',
        'model:user',
        'model:citation',
        'model:license',
        'transform:links',
        'transform:embed',
        'service:theme'
    ],
    beforeEach: function () {
       this.register('service:panel-actions', panelActionsStub);
       this.inject.service('panel-actions', { as: 'panelActions' });
   }

});

///////////////////////////////////////////////////////////////////////////////
// Test COMPUTED PROPERTIES > SUBMIT CONTROLLER

test('isTopLevelNode computed property', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let node = store.createRecord('node', {
            parent: store.createRecord('node', {
                id: '12345'
            }),
            contributors: []
        });
        assert.equal(ctrl.get('isTopLevelNode'), null);
        ctrl.set('node', node);
        assert.equal(ctrl.get('isTopLevelNode'), false);
    });
});

test('hasFile computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('hasFile'), false);
    ctrl.set('file', 'Test File');
    assert.equal(ctrl.get('hasFile'), true);
});

test('uploadValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('uploadValid'), false);
    ctrl.set('nodeLocked', true);
    assert.equal(ctrl.get('uploadValid'), true);
});

test('abstractValid computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsAbstract', 'Short abstract');
    assert.equal(ctrl.get('abstractValid'), false);
    ctrl.set('basicsAbstract', 'Abstract of sufficient length');
    assert.equal(ctrl.get('abstractValid'), true);
});

test('doiValid computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsDOI', 'Invalid DOI');
    assert.equal(ctrl.get('doiValid'), false);
    ctrl.set('basicsDOI', '10.1234/hello');
    assert.equal(ctrl.get('doiValid'), true);
});

test('basicsValid computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('abstractValid', false);
    ctrl.set('doiValid', false);
    ctrl.set('licenseValid', false);
    assert.equal(ctrl.get('basicsValid'), false);
    ctrl.set('abstractValid', true);
    ctrl.set('doiValid', true);
    ctrl.set('licenseValid', true);
    assert.equal(ctrl.get('basicsValid'), true);
});

test('authorsValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('authorsValid'), false);
    ctrl.set('contributors', ['Jane Goodall']);
    assert.equal(ctrl.get('authorsValid'), true);
});

test('disciplineValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('disciplineValid'), false);
    ctrl.set('subjectsList', [['Test Subject']]);
    assert.equal(ctrl.get('disciplineValid'), true);
});

test('savedTitle computed property', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let node = store.createRecord('node', {});
        let nodeWithTitle = store.createRecord('node', {
            'title': 'Node title'
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('savedTitle'), false);
        ctrl.set('node', nodeWithTitle);
        assert.equal(ctrl.get('savedTitle'), true);
    });
});

test('savedFile computed property', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let file = store.createRecord('file', {
            'id': '12345'
        });
        let preprint = store.createRecord('preprint', {
            primaryFile: null
        });
        let preprintWithFile = store.createRecord('preprint', {
            primaryFile: file
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('savedFile'), false);
        ctrl.set('model', preprintWithFile);
        assert.equal(ctrl.get('savedFile'), true);
    });
});

test('savedAbstract computed property', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let node = store.createRecord('node', {});
        let nodeWithDescription = store.createRecord('node', {
            'description': 'The Best Description'
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('savedAbstract'), false);
        ctrl.set('node', nodeWithDescription);
        assert.equal(ctrl.get('savedAbstract'), true);
    });
});

test('savedSubjects computed property', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let model = store.createRecord('preprint', {
            'subjects': []
        });
        let modelWithSubjects = store.createRecord('preprint', {
            'subjects': [['Test subject']]
        });
        ctrl.set('model', model);
        assert.equal(ctrl.get('savedSubjects'), false);
        ctrl.set('model', modelWithSubjects);
        assert.equal(ctrl.get('savedSubjects'), true);
    });
});

test('allSectionsValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('savedTitle', true);
    ctrl.set('savedFile', true);
    ctrl.set('savedAbstract', true);
    ctrl.set('savedSubjects', true);
    ctrl.set('authorsValid', true);
    assert.equal(ctrl.get('allSectionsValid'), true);
});

test('preprintFileChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let file = store.createRecord('file', {
            'id': '12345'
        });
        let preprint = store.createRecord('preprint', {
            'primaryFile': file
        });
        ctrl.set('file', file);
        assert.equal(ctrl.get('preprintFileChanged'), true);
        ctrl.set('file', null);
        assert.equal(ctrl.get('preprintFileChanged'), false);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('preprintFileChanged'), true);
        ctrl.set('selectedFile', file);
        assert.equal(ctrl.get('preprintFileChanged'), false);
    });
});

test('titleChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'title': 'Test title'
        });
        ctrl.set('node', node);
        ctrl.set('nodeTitle', 'Test title');
        assert.equal(ctrl.get('titleChanged'), false);
        ctrl.set('nodeTitle', 'Changed title');
        assert.equal(ctrl.get('titleChanged'), true);
    });
});

test('uploadChanged computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('preprintFileChanged', false);
    ctrl.set('titleChanged', false);
    assert.equal(ctrl.get('uploadChanged'), false);
    ctrl.set('preprintFileChanged', true);
    assert.equal(ctrl.get('uploadChanged'), true);
    ctrl.set('preprintFileChanged', false);
    ctrl.set('titleChanged', true);
    assert.equal(ctrl.get('uploadChanged'), true);
});

test('basicsAbstract computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('basicsAbstract'), null);
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'description': 'A great abstract'
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('basicsAbstract'), 'A great abstract');
    });
});

test('abstractChanged computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsAbstract', 'Abstract with whitespace ');
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'description': 'A great abstract'
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('abstractChanged'), true);
        node.set('description', 'Abstract with whitespace');
        assert.equal(ctrl.get('abstractChanged'), false);
    });
});

test('basicsTags computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'tags': ['firstTag', 'secondTag']
        });
        assert.equal(ctrl.get('basicsTags').length, 0);
        ctrl.set('node', node);
        assert.equal(ctrl.get('basicsTags').length, 2);
    });
});

test('tagsChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'tags': ['firstTag', 'secondTag']
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('tagsChanged'), false);
        ctrl.set('basicsTags', ['changedTag']);
        assert.equal(ctrl.get('tagsChanged'), true);
    });
});

test('basicsDOI', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let preprint = store.createRecord('preprint', {
            'doi': '10.1234/hello'
        });
        assert.equal(ctrl.get('basicsDOI'), null);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsDOI'), '10.1234/hello');
    });
});

test('doiChanged', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let preprint = store.createRecord('preprint', {
            'doi': '10.1234/hello'
        });
        assert.equal(ctrl.get('doiChanged'), undefined);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('doiChanged'), false);
        ctrl.set('basicsDOI', '10.1234/changed_doi');
        assert.equal(ctrl.get('doiChanged'), true);
    });
});

test('basicsLicense', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let license = store.createRecord('license', {
            'name': 'No license'
        });
        let preprint = store.createRecord('preprint', {
            license: license,
            licenseRecord: {
                'year': '2016',
                'copyright_holders': ['Sally Ride']
            },
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsLicense.year'), '2016');
        assert.equal(ctrl.get('basicsLicense.copyrightHolders'), 'Sally Ride');
        assert.equal(ctrl.get('basicsLicense.licenseType.name'), license.get('name'));
    });
});

test('licenseChanged with model set', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let license = store.createRecord('license', {
            'name': 'No license'
        });
        let preprint = store.createRecord('preprint', {
            license: license,
            licenseRecord: {
                'year': '2016',
                'copyright_holders': ['Sally Ride']
            },
        });
        let basicsLicense = {
            year: '2016' ,
            copyrightHolders: 'Sally Ride',
            licenseType: Ember.$.extend(true, {}, license)
        };
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('licenseChanged'), false);
        basicsLicense.copyrightHolders = 'Kalpana Chawla';
        ctrl.set('basicsLicense', Ember.$.extend(true, {}, basicsLicense));
        assert.equal(ctrl.get('licenseChanged'), true);
        ctrl.set('basicsLicense.copyrightHolders', 'Sally Ride');
        assert.equal(ctrl.get('licenseChanged'), false);
        ctrl.set('basicsLicense.year', '2017');
        assert.equal(ctrl.get('licenseChanged'), true);
        ctrl.set('basicsLicense.year', '2016');
        assert.equal(ctrl.get('licenseChanged'), false);
        ctrl.set('basicsLicense.licenseType', store.createRecord('license', {'name': 'MIT License'}));
        assert.equal(ctrl.get('licenseChanged'), true);
    });
});

test('licenseChanged with no model set', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let license = store.createRecord('license', {
            'name': 'No license'
        });
        let basicsLicense = {
            year: '2016' ,
            copyrightHolders: 'Sally Ride',
            licenseType: Ember.$.extend(true, {}, license)
        };
        // TODO is below assertion correct?
        assert.equal(ctrl.get('licenseChanged'), true);
        assert.equal(ctrl.get('basicsLicense.licenseType.name'), null);
        ctrl.set('basicsLicense', basicsLicense);
        assert.equal(ctrl.get('licenseChanged'), true);
    });
});

test('basicsChanged computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('tagsChanged', false);
    ctrl.set('abstractChanged', false);
    ctrl.set('doiChanged', false);
    ctrl.set('licenseChanged', false);
    assert.equal(ctrl.get('basicsChanged'), false);
    ctrl.set('tagsChanged', true);
    ctrl.set('abstractChanged', true);
    ctrl.set('doiChanged', true);
    ctrl.set('licenseChanged', true);
    assert.equal(ctrl.get('basicsChanged'), true);
});

test('subjectsList', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let preprint = store.createRecord('preprint', {
            'subjects': [['Subject First Level', 'Subject Second Level']]
        });
        assert.equal(ctrl.get('subjectsList').length, 0);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('subjectsList').length, 1);
        assert.equal(ctrl.get('subjectsList')[0].length, 2);
    });
});

test('disciplineReduced', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    let engineeringDisciplines = [[{id: '12345'},{'id':'56789'}], [{id: '12345'}], [{id: '12250'}] ];
    Ember.run(() => {
        let preprint = store.createRecord('preprint', {
            'subjects': engineeringDisciplines
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('disciplineReduced').length, 3);
        assert.equal(ctrl.get('disciplineReduced')[0].id, '12345');
        assert.equal(ctrl.get('disciplineReduced')[1].id, '56789');
        assert.equal(ctrl.get('disciplineReduced')[2].id, '12250');
    });
});

test('disciplineChanged', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let preprint = store.createRecord('preprint', {
            'subjects': [[{id: '12345'},{id:'56789'}]]
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('disciplineChanged'), false);
        ctrl.set('subjectsList', [[{id: '12345'},{id:'12250'}]]);
        assert.equal(ctrl.get('disciplineChanged'), true);
    });
});

test('isAdmin', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'currentUserPermissions': 'administrator'
        });
        let readNode = store.createRecord('node', {
            'currentUserPermissions': 'read'
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('isAdmin'), true);
        ctrl.set('node', readNode);
        assert.equal(ctrl.get('isAdmin'), false);
    });
});

test('canEdit', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    let store = this.store;
    Ember.run(() => {
        let node = store.createRecord('node', {
            'currentUserPermissions': 'administrator',
            'registration': true
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('canEdit'), false);
    });
});

///////////////////////////////////////////////////////////////////////////////
// Test CONTROLLER ACTIONS > SUBMIT CONTROLLER
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

skip('next opens next panel and flashes changes saved', function() {
    test('next opens next panel and flashes changes saved', function(assert) {
        const ctrl = this.subject();
        const currentPanelName = 'Discipline';
        panels = Ember.Object.create({
            'Discipline': Ember.Object.create({'isOpen': true}), 'Basics': Ember.Object.create({'isOpen': false})
        });
        assert.equal('Basics', ctrl.get(`_names.${ctrl.get('_names').indexOf(currentPanelName) + 1}`));
        return wait().then(() => {
            ctrl.send('next', currentPanelName);
            assert.equal(panels.get('Discipline.isOpen'), true);
            assert.equal(panels.get('Basics.isOpen'), true);
        });
    });
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

skip('changesSaved temporarily changes currentPanelSaveState to true', function() {
    test('changesSaved temporarily changes currentPanelSaveState to true', function(assert) {
        // TODO changesSaved has a setTimeout which causes "calling set on destroyed object" to be thrown.
        // How to wait until setTimeout has finished before breaking test down?
        const ctrl = this.subject();
        let currentPanelName = 'Discipline';
        assert.equal(ctrl.get('disciplineSaveState'), false);
        ctrl.send('changesSaved', currentPanelName);
    });
});

test('error', function(assert) {
    // TODO How to properly test this?  The error action creates an error
    // toast message displaying the error message
    const ctrl = this.subject();
    let error = 'This is incorrect.';
    ctrl.send('error', error);
    assert.equal(error, error);
});

skip('changeInitialState', function() {
    // test('changeInitialState', function(assert) {
    //     // TODO testing panel actions - third party
    // });
});

test('lockNode', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('nodeLocked'), false);
    ctrl.send('lockNode');
    assert.equal(ctrl.get('nodeLocked'), true);
});

skip('finishUpload', function() {
    // test('finishUpload', function(assert) {
    //     //TODO finishUpload calls 'next' action. Haven't gotten 'next' working in tests yet
    // })
});


skip('existingNodeExistingFile', function() {
    // test('existingNodeExistingFile', function(assert) {
    //     // TODO Many actions get called by this action. Sending POST to localhost:7357/nodeTags
    //     // Getting Assertion Failed: You can only unload a record which is not inFlight
    //     this.inject.service('store');
    //     let store = this.store;
    //     const ctrl = this.subject();
    //     Ember.run(() => {
    //         let node = store.createRecord('node', {
    //             title: 'hello',
    //             tags: ['first tag'],
    //             description: 'The best abstract'
    //         });
    //         ctrl.set('nodeTitle', 'New title')
    //         ctrl.set('node', node);
    //         ctrl.send('existingNodeExistingFile');
    //         assert.equal(ctrl.get('node.title'), 'New title');
    //         assert.equal(ctrl.get('basicsAbstract'), node.get('description'));
    //     });
    // });
});


skip('createComponentCopyFile', function() {
    // test('createComponentCopyFile', function(assert) {
    //     // TODO - same error with You can only unload a record which is not inFlight.
    //     // Assert that node has a child
    //     this.inject.service('store');
    //     let store = this.store;
    //     const ctrl = this.subject();
    //     Ember.run(() => {
    //         let node = store.createRecord('node', {
    //             title: 'hello',
    //             tags: ['first tag'],
    //             description: 'The best abstract'
    //         });
    //         ctrl.set('nodeTitle', 'New title');
    //         ctrl.set('node', node);
    //         ctrl.send('createComponentCopyFile');
    //     });
    // });
});

skip('resumeAbandonedPreprint', function() {
    // test('resumeAbandonedPreprint', function(assert) {
    //     //TODO class startPreprint, which haven't figured out how to test yet
    // });
});

skip('startPreprint', function() {
     // test('startPreprint', function(assert) {
    //     //TODO
    // });
});

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

test('clearDownstreamFields in entire upload section', function(assert) {
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let node = store.createRecord('node', {
            title: 'hello'
        });
        ctrl.set('node', node);
        ctrl.set('selectedFile', 'Test file');
        ctrl.set('file', 'file');
        ctrl.set('convertOrCopy', 'copy');
        ctrl.set('nodeTitle', 'Test title');
        ctrl.send('clearDownstreamFields', 'allUpload');
        assert.equal(ctrl.get('node'), null);
        assert.equal(ctrl.get('selectedFile'), null);
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('convertOrCopy'), null);
        assert.equal(ctrl.get('nodeTitle'), null);
    });
});

test('discardBasics', function(assert) {
    // assert.expect(4);
    this.inject.service('store');
    let store = this.store;
    const ctrl = this.subject();
    Ember.run(() => {
        let node = store.createRecord('node', {
            title: 'hello',
            tags: ['first tag'],
            description: 'The best abstract'
        });

        let preprint = store.createRecord('preprint', {
            doi: '10.1234/test_doi',
            licenseRecord: {
                'year': '2016',
                'copyright_holders': ['Amelia Earhart']
            },
            license: 'No License'
        });

        ctrl.set('node', node);
        ctrl.set('model', preprint);
        ctrl.set('basicsTags', ['second Tag']);
        ctrl.set('basicsAbstract', 'Test abstract');
        ctrl.set('basicsDOI', null);
        ctrl.set('basicsLicense', 'Test license');
        ctrl.send('discardBasics');
        assert.equal(ctrl.get('basicsTags')[0], node.get('tags')[0]);
        assert.equal(ctrl.get('basicsAbstract'), node.get('description'));
        assert.equal(ctrl.get('basicsDOI'), preprint.get('doi'));
        // TODO promise hasn't resolved so this is incorrect.
        // assert.equal(ctrl.get('basicsLicense.year'), preprint.get('licenseRecord.year'));
    });
});

test('stripDOI', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsDOI', ' https://dx.doi.org/10.1234/hello ');
    ctrl.send('stripDOI');
    assert.equal(ctrl.get('basicsDOI'), '10.1234/hello');
});

skip('saveBasics', function() {
    // test('saveBasics', function(assert) {
    //     this.inject.service('store');
    //     let store = this.store;
    //     const ctrl = this.subject();
    //     Ember.run.later(() => {
    //         let node = store.createRecord('node', {
    //             title: 'hello',
    //             tags: ['tags'],
    //             description: 'This is an abstract.'
    //         });
    //         let preprint = store.createRecord('preprint', {
    //             primaryFile: 'Test file',
    //             'doi': '10.1234/test'
    //         });
    //         ctrl.set('node', node);
    //         ctrl.set('model', preprint);
    //         ctrl.send('saveBasics');
    //
    //     });
    // });
});

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


skip('discardSubjects', function() {
    // test('discardSubjects', function(assert) {
    //     //TODO
    // })
});

skip('saveSubjects', function() {
    // test('saveSubjects', function(assert) {
    //     //TODO
    // })
});


skip('findContributors', function() {
    // test('findContributors', function(assert) {
    //     //TODO
    // })
});


skip('highlightSuccessOrFailure', function() {
    // test('highlightSuccessOrFailure', function(assert) {
    //     //TODO
    // })
});


///////////////////////////////////////////////////////////////////////////////
// Test Submit Controller > Initial Defaults

test('toggleSharePreprintModal', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('showModalSharePreprint'), false);
    ctrl.send('toggleSharePreprintModal');
    assert.equal(ctrl.get('showModalSharePreprint'), true);
});

skip('savePreprint', function() {
    test('savePreprint', function() {
        //TODO
    });
});

test('submit controller property defaults - add mode', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('_State.START'), 'start');
    assert.equal(ctrl.get('_State.NEW'), 'new');
    assert.equal(ctrl.get('_State.EXISTING'), 'existing');
    assert.equal(ctrl.get('filePickerState'), 'start');
    assert.equal(ctrl.get('_existingState.CHOOSE'), 'choose');
    assert.equal(ctrl.get('_existingState.EXISTINGFILE'), 'existing');
    assert.equal(ctrl.get('_existingState.NEWFILE'), 'new');
    assert.equal(ctrl.get('existingState'), 'choose');
    assert.equal(ctrl.get('_names').length, 5);
    assert.equal(ctrl.get('user'), null);
    assert.equal(ctrl.get('userNodes').length, 0);
    assert.equal(ctrl.get('userNodesLoaded'), false);
    assert.equal(ctrl.get('availableLicenses').length, 0);
    assert.equal(ctrl.get('applyLicense'), false);
    assert.equal(ctrl.get('newNode'), false);
    assert.equal(ctrl.get('node'), null);
    assert.equal(ctrl.get('file'), null);
    assert.equal(ctrl.get('selectedFile'), null);
    assert.equal(ctrl.get('contributors').length, 0);
    assert.equal(ctrl.get('nodeTitle'), null);
    assert.equal(ctrl.get('nodeLocked'), false);
    assert.equal(ctrl.get('searchResults').length, 0);
    assert.equal(ctrl.get('savingPreprint'), false);
    assert.equal(ctrl.get('showModalSharePreprint'), false);
    assert.equal(ctrl.get('uploadSaveState'), false);
    assert.equal(ctrl.get('disciplineSaveState'), false);
    assert.equal(ctrl.get('basicsSaveState'), false);
    assert.equal(ctrl.get('authorsSaveState'), false);
    assert.equal(ctrl.get('parentNode'), null);
    assert.equal(ctrl.get('parentContributors').length, 0);
    assert.equal(ctrl.get('convertProjectConfirmed'), false);
    assert.equal(ctrl.get('convertOrCopy'), null);
    assert.equal(ctrl.get('osfStorageProvider'), null);
    assert.equal(ctrl.get('osfProviderLoaded'), false);
    assert.equal(ctrl.get('titleValid'), null);
    assert.equal(ctrl.get('disciplineModifiedToggle'), false);
    assert.equal(ctrl.get('uploadInProgress'), false);
    assert.equal(ctrl.get('existingPreprints').length, 0);
    assert.equal(ctrl.get('abandonedPreprint'), null);
    assert.equal(ctrl.get('editMode'), false);
    assert.equal(ctrl.get('shareButtonDisabled'), false);
    assert.equal(ctrl.get('licenseValid'), false);
});
