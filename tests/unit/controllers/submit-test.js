import { moduleFor, skip } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import moment from 'moment';
import $ from 'jquery';
import { manualSetup, mockFindAll } from 'ember-data-factory-guy';

const panelNames = [
    'Discipline',
    'Basics',
    'uploadNewFile',
];

const panels = EmberObject.create();

for (const panelName of panelNames) {
    panels.set(panelName, EmberObject.create({
        isOpen: panelName === 'Discipline',
    }));
}

// Stub panelActions service
const panelActionsStub = Service.extend({
    open(name) {
        const panel = panels[name];
        panel.set('isOpen', true);
    },
    close(name) {
        const panel = panels[name];
        panel.set('isOpen', false);
    },
    toggle(name) {
        const panel = panels[name];
        return panel.get('isOpen') ? panel.set('isOpen', false) : panel.set('isOpen', true);
    },
});


moduleFor('controller:submit', 'Unit | Controller | submit', {
    needs: [
        'validator:presence',
        'validator:length',
        'validator:format',
        'validator:date',
        'service:metrics',
        'service:panel-actions',
        'service:session',
        'service:fileManager',
        'service:head-tags',
        'service:theme',
        'service:toast',
        'service:i18n',
        'model:review-action',
        'model:file',
        'model:file-version',
        'model:comment',
        'model:node',
        'model:license',
        'model:taxonomy',
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
        'model:wiki',
        'transform:links',
        'transform:embed',
        'transform:fixstring',
    ],
    beforeEach () {
        manualSetup(this.container);
        mockFindAll('preprint-provider');
        this.register('service:panel-actions', panelActionsStub);
        this.inject.service('panel-actions', { as: 'panelActions' });
        // Overwrite these observers with no-ops. They call loadAll(),
        // which uses queryHasMany() and does not work well for tests.
        this.subject().set('getContributors', () => undefined);
        this.subject().set('getParentContributors', () => undefined);
    },

});

test('Initial properties', function (assert) {
    const ctrl = this.subject();

    const expected = {
        '_State.START': 'start',
        '_State.NEW': 'new',
        '_State.EXISTING': 'existing',
        filePickerState: 'start',
        '_existingState.CHOOSE': 'choose',
        '_existingState.EXISTINGFILE': 'existing',
        '_existingState.NEWFILE': 'new',
        existingState: 'choose',
        '_names.length': 5,
        user: null,
        'userNodes.length': 0,
        userNodesLoaded: false,
        'availableLicenses.length': 0,
        applyLicense: false,
        newNode: false,
        node: null,
        file: null,
        selectedFile: null,
        'contributors.length': 0,
        title: null,
        nodeLocked: false,
        'searchResults.length': 0,
        savingPreprint: false,
        showModalSharePreprint: false,
        uploadSaveState: false,
        disciplineSaveState: false,
        basicsSaveState: false,
        authorsSaveState: false,
        parentNode: null,
        'parentContributors.length': 0,
        convertProjectConfirmed: false,
        convertOrCopy: null,
        osfStorageProvider: null,
        osfProviderLoaded: false,
        titleValid: null,
        uploadInProgress: false,
        'existingPreprints.length': 0,
        abandonedPreprint: null,
        editMode: false,
        shareButtonDisabled: false,
        licenseValid: false,
    };

    const propKeys = Object.keys(expected);
    const actual = ctrl.getProperties(propKeys);

    propKeys.forEach(key => assert.strictEqual(
        expected[key],
        actual[key],
        `Initial value for "${key}" does not match expected value`,
    ));
});

// /////////////////////////////////////////////////////////////////////////////
// Test COMPUTED PROPERTIES > SUBMIT CONTROLLER

test('isTopLevelNode computed property', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const node = store.createRecord('node', {
            parent: store.createRecord('node', {
                id: '12345',
            }),
            contributors: [],
        });
        assert.equal(ctrl.get('isTopLevelNode'), true);
        ctrl.set('node', node);
        assert.equal(ctrl.get('isTopLevelNode'), false);
    });
});

test('hasFile computed property', function(assert) {
    const ctrl = this.subject();
    assert.notOk(ctrl.get('hasFile'));
    ctrl.set('file', 'Test File');
    assert.ok(ctrl.get('hasFile'));
});

// TODO clearFields function

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
test('originalPublicationDateValid computed property', function(assert) {
    const ctrl = this.subject();
    const tomorrow = moment().add(1, 'days');
    const today = moment();
    const yesterday = moment().subtract(1, 'days');
    ctrl.set('basicsOriginalPublicationDate', tomorrow);
    assert.equal(ctrl.get('originalPublicationDateValid'), false);
    ctrl.set('basicsOriginalPublicationDate', today);
    assert.equal(ctrl.get('originalPublicationDateValid'), true);
    ctrl.set('basicsOriginalPublicationDate', yesterday);
    assert.equal(ctrl.get('originalPublicationDateValid'), true);
});

// TODO licenseValid

test('basicsValid computed property', function(assert) {
    const ctrl = this.subject();
    const invalidDate = moment().add(1, 'days');
    const validDate = moment().subtract(1, 'days');

    ctrl.set('basicsAbstract', 'too short');
    ctrl.set('basicsDOI', 'Invalid DOI');
    ctrl.set('licenseValid', false);
    ctrl.set('basicsOriginalPublicationDate', invalidDate);
    assert.equal(ctrl.get('basicsValid'), false);
    ctrl.set('basicsAbstract', 'Abstract onif sufficient length');
    ctrl.set('basicsDOI', '10.1234/hello');
    ctrl.set('licenseValid', true);
    ctrl.set('basicsOriginalPublicationDate', validDate);
    assert.equal(ctrl.get('basicsValid'), true);
});

test('authorsValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('authorsValid'), false);
    ctrl.set('contributors', ['Jane Goodall']);
    assert.equal(ctrl.get('authorsValid'), true);
});

test('savedTitle computed property', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const preprint = store.createRecord('preprint', {});
        const preprintWithTitle = store.createRecord('preprint', {
            title: 'Node title',
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('savedTitle'), false);
        ctrl.set('model', preprintWithTitle);
        assert.equal(ctrl.get('savedTitle'), true);
        run.cancelTimers();
    });
});

test('savedFile computed property', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const file = store.createRecord('file', {
            id: '12345',
        });
        const preprint = store.createRecord('preprint', {
            primaryFile: null,
        });
        const preprintWithFile = store.createRecord('preprint', {
            primaryFile: file,
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('savedFile'), false);
        ctrl.set('model', preprintWithFile);
        assert.equal(ctrl.get('savedFile'), true);
        run.cancelTimers();
    });
});

test('savedAbstract computed property', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const preprint = store.createRecord('preprint', {});
        const preprintWithDescription = store.createRecord('preprint', {
            description: 'The Best Description',
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('savedAbstract'), false);
        ctrl.set('model', preprintWithDescription);
        assert.equal(ctrl.get('savedAbstract'), true);
        run.cancelTimers();
    });
});

test('savedSubjects computed property', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const model = store.createRecord('preprint', {
            subjects: [],
        });
        const modelWithSubjects = store.createRecord('preprint', {
            subjects: [['Test subject']],
        });
        ctrl.set('model', model);
        assert.equal(ctrl.get('savedSubjects'), false);
        ctrl.set('model', modelWithSubjects);
        assert.equal(ctrl.get('savedSubjects'), true);
        run.cancelTimers();
    });
});

test('allSectionsValid computed property', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('savedTitle', true);
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('savedFile', true);
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('savedAbstract', true);
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('savedSubjects', true);
    assert.equal(ctrl.get('allSectionsValid'), false);
    ctrl.set('authorsValid', true);
    assert.equal(ctrl.get('allSectionsValid'), true);
});

test('preprintFileChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const file = store.createRecord('file', {
            id: '12345',
        });
        const preprint = store.createRecord('preprint', {
            primaryFile: file,
        });
        ctrl.set('file', file);
        assert.equal(ctrl.get('preprintFileChanged'), true);
        ctrl.set('file', null);
        assert.equal(ctrl.get('preprintFileChanged'), false);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('preprintFileChanged'), false);
        ctrl.set('selectedFile', file);
        assert.equal(ctrl.get('preprintFileChanged'), false);
    });
});

test('titleChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'Test title',
        });
        ctrl.set('model', preprint);
        ctrl.set('title', 'Test title');
        assert.equal(ctrl.get('titleChanged'), false);
        ctrl.set('title', 'Changed title');
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
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            description: 'A great abstract',
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsAbstract'), 'A great abstract');
        run.cancelTimers();
    });
});

test('abstractChanged computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('basicsAbstract', 'Abstract with whitespace ');
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const model = store.createRecord('preprint', {
            description: 'A great abstract',
        });
        ctrl.set('model', model);
        assert.equal(ctrl.get('abstractChanged'), true);
        model.set('description', 'Abstract with whitespace');
        assert.equal(ctrl.get('abstractChanged'), false);
    });
});

test('basicsTags computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            tags: ['firstTag', 'secondTag'],
        });
        assert.equal(ctrl.get('basicsTags').length, 0);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsTags').length, 2);
    });
});

test('tagsChanged computed property', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;

    run(() => {
        const preprint = store.createRecord('preprint', {
            tags: ['firstTag', 'secondTag'],
        });

        ctrl.set('model', preprint);
        assert.equal(ctrl.get('tagsChanged'), false);

        ctrl.get('basicsTags').pushObject('newTag');
        assert.equal(ctrl.get('tagsChanged'), true);
    });
});

test('basicsDOI', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            doi: '10.1234/hello',
        });
        assert.equal(ctrl.get('basicsDOI'), null);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsDOI'), '10.1234/hello');
    });
});

test('doiChanged', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            doi: '10.1234/hello',
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
    const { store } = this;
    run(() => {
        const license = store.createRecord('license', {
            name: 'No license',
        });
        const preprint = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2016',
                copyright_holders: ['Sally Ride'],
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
    const { store } = this;
    run(() => {
        const license = store.createRecord('license', {
            name: 'No license',
        });
        const preprint = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2016',
                copyright_holders: ['Sally Ride'],
            },
        });
        const basicsLicense = {
            year: '2016',
            copyrightHolders: 'Sally Ride',
            licenseType: $.extend(true, {}, license),
        };
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('licenseChanged'), false);
        basicsLicense.copyrightHolders = 'Kalpana Chawla';
        ctrl.set('basicsLicense', $.extend(true, {}, basicsLicense));
        assert.equal(ctrl.get('licenseChanged'), true);
        ctrl.set('basicsLicense.copyrightHolders', 'Sally Ride');
        assert.equal(ctrl.get('licenseChanged'), false);
        ctrl.set('basicsLicense.year', '2017');
        assert.equal(ctrl.get('licenseChanged'), true);
        ctrl.set('basicsLicense.year', '2016');
        assert.equal(ctrl.get('licenseChanged'), false);
        ctrl.set('basicsLicense.licenseType', store.createRecord('license', { name: 'MIT License' }));
        assert.equal(ctrl.get('licenseChanged'), true);
    });
});

test('licenseChanged with no model set', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const license = store.createRecord('license', {
            name: 'No license',
        });
        const basicsLicense = {
            year: '2016',
            copyrightHolders: 'Sally Ride',
            licenseType: $.extend(true, {}, license),
        };
        // TODO is below assertion correct?
        assert.equal(ctrl.get('licenseChanged'), true);
        assert.equal(ctrl.get('basicsLicense.licenseType.name'), null);
        ctrl.set('basicsLicense', basicsLicense);
        assert.equal(ctrl.get('licenseChanged'), true);
    });
});

test('basicsLicense with multiple copyrightHolders', function(assert) {
    const ctrl = this.subject();
    const model = {
        licenseRecord: {
            copyright_holders: ['Frank', 'Everest'],
        },
    };
    run(() => {
        ctrl.set('model', model);
        assert.equal(ctrl.get('basicsLicense').copyrightHolders, 'Frank, Everest');
    });
});

test('basicsOriginalPublicationDate', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const today = moment();
        const preprint = store.createRecord('preprint', {
            originalPublicationDate: today,
        });
        assert.equal(ctrl.get('basicsOriginalPublicationDate'), null);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('basicsOriginalPublicationDate'), today);
    });
});

test('originalPublicationDateChanged', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            originalPublicationDate: moment(),
        });
        assert.equal(ctrl.get('originalPublicationDateChanged'), undefined);
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('originalPublicationDateChanged'), false);
        ctrl.set('basicsOriginalPublicationDate', moment());
        assert.equal(ctrl.get('originalPublicationDateChanged'), true);
    });
});

test('discardBasics properly joins copyrightHolders', function(assert) {
    assert.expect(1);
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const model = store.createRecord('preprint', {
            tags: ['tags'],
            licenseRecord: {
                copyright_holders: ['Frank', 'Everest'],
            },
        });
        const license = store.createRecord('license', {
            name: 'No license',
        });
        model.set('license', license);
        ctrl.set('model', model);
        ctrl.send('discardBasics');
        assert.equal(ctrl.get('basicsLicense').copyrightHolders, 'Frank, Everest');
    });
});

test('basicsChanged computed property', function(assert) {
    const ctrl = this.subject();
    ctrl.set('tagsChanged', false);
    ctrl.set('abstractChanged', false);
    ctrl.set('doiChanged', false);
    ctrl.set('licenseChanged', false);
    ctrl.set('originalPublicationDateChanged', false);
    assert.equal(ctrl.get('basicsChanged'), false);
    ctrl.set('tagsChanged', true);
    ctrl.set('abstractChanged', true);
    ctrl.set('doiChanged', true);
    ctrl.set('licenseChanged', true);
    ctrl.set('originalPublicationDateChanged', true);
    assert.equal(ctrl.get('basicsChanged'), true);
});

test('subjectsList', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const preprint = store.createRecord('preprint', {
            subjects: [['Subject First Level', 'Subject Second Level']],
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
    const { store } = this;
    const engineeringDisciplines = [[{ id: '12345' }, { id: '56789' }], [{ id: '12345' }], [{ id: '12250' }]];
    run(() => {
        const preprint = store.createRecord('preprint', {
            subjects: engineeringDisciplines,
        });
        ctrl.set('model', preprint);
        assert.equal(ctrl.get('disciplineReduced').length, 3);
        assert.equal(ctrl.get('disciplineReduced')[0].id, '12345');
        assert.equal(ctrl.get('disciplineReduced')[1].id, '56789');
        assert.equal(ctrl.get('disciplineReduced')[2].id, '12250');
    });
});

test('isAdmin', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const node = store.createRecord('node', {
            currentUserPermissions: 'administrator',
        });
        const readNode = store.createRecord('node', {
            currentUserPermissions: 'read',
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
    const { store } = this;
    run(() => {
        const node = store.createRecord('node', {
            currentUserPermissions: 'administrator',
            registration: true,
        });
        ctrl.set('node', node);
        assert.equal(ctrl.get('canEdit'), false);
    });
});

// /////////////////////////////////////////////////////////////////////////////
// Test CONTROLLER ACTIONS > SUBMIT CONTROLLER
test('editLicense sets basicsLicense and licenseValid', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('basicsLicense.copyrightHolders'), '');
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
    assert.expect(3);
    // TODO fix: Error: Assertion Failed: calling set on destroyed object:

    const ctrl = this.subject();
    const currentPanelName = 'Discipline';

    run(() => {
        panels.setProperties({
            Discipline: EmberObject.create({ isOpen: true }),
            Basics: EmberObject.create({ isOpen: false }),
        });

        assert.equal('Basics', ctrl.get(`_names.${ctrl.get('_names').indexOf(currentPanelName) + 1}`));

        ctrl.send('next', currentPanelName);
        run.cancelTimers();

        assert.equal(panels.get('Discipline.isOpen'), false);
        assert.equal(panels.get('Basics.isOpen'), true);
    });
});

test('nextUploadSection closes current panel and opens next panel', function(assert) {
    // TODO not really testing anything except the stub
    const ctrl = this.subject();
    panels.setProperties({
        Discipline: EmberObject.create({ isOpen: true }),
        Basics: EmberObject.create({ isOpen: false }),
    });
    ctrl.send('nextUploadSection', 'Discipline', 'Basics');
    assert.equal(panels.get('Discipline.isOpen'), false);
    assert.equal(panels.get('Basics.isOpen'), true);
});

skip('changesSaved temporarily changes currentPanelSaveState to true', function(assert) {
    assert.expect(2);

    const ctrl = this.subject();
    const currentPanelName = 'Discipline';
    assert.equal(ctrl.get('disciplineSaveState'), false);

    return run(() => {
        ctrl.send('changesSaved', currentPanelName);

        run.next(ctrl, () => {
            assert.equal(ctrl.get('disciplineSaveState'), true);
        });
    });
});

test('error action exists', function(assert) {
    const ctrl = this.subject();
    assert.ok(ctrl.actions.error);
});

skip('changeInitialState', function(assert) {
    // TODO testing panel actions - third party
    assert.ok();
});

skip('finishUpload', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('nodeLocked'), false);

    run(() => {
        ctrl.send('finishUpload');

        assert.equal(ctrl.get('nodeLocked'), true);
        assert.equal(ctrl.get('file'), null);

        run.cancelTimers();
    });
});

skip('existingNodeExistingFile', function(assert) {
    // TODO Many actions get called by this action. Sending POST to localhost:7357/nodeTags
    // Getting Assertion Failed: You can only unload a record which is not inFlight
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();

    const node = store.createRecord('node', {
        title: 'hello',
        // tags: ['first tag'],
        description: 'The best abstract',
    });

    run(() => {
        ctrl.set('nodeTitle', 'New title');
        ctrl.set('node', node);

        ctrl.send('existingNodeExistingFile');

        run.next(() => {
            assert.equal(ctrl.get('node.title'), 'New title');
            assert.equal(ctrl.get('basicsAbstract'), node.get('description'));
        });
    });
});


skip('createComponentCopyFile', function() {
    // TODO - same error with You can only unload a record which is not inFlight.
    // Assert that node has a child
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const node = store.createRecord('node', {
            title: 'hello',
            tags: ['first tag'],
            description: 'The best abstract',
        });
        ctrl.set('nodeTitle', 'New title');
        ctrl.set('node', node);
        ctrl.send('createComponentCopyFile');
    });
});

skip('resumeAbandonedPreprint', function() {
    // TODO class startPreprint, which haven't figured out how to test yet
});

skip('startPreprint', function() {
    // TODO
});

test('selectExistingFile', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('selectedFile'), null);
    ctrl.send('selectExistingFile', 'my-file.jpg');
    assert.equal(ctrl.get('selectedFile'), 'my-file.jpg');
});

test('discardUploadChanges', function(assert) {
    this.inject.service('store');
    const { store } = this;
    run(() => {
        const file = store.createRecord('file', {
            id: '12345',
        });
        const preprint = store.createRecord('preprint', {
            primaryFile: file,
            title: 'hello',
        });
        const ctrl = this.subject();

        ctrl.set('model', preprint);
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('selectedFile'), null);
        assert.equal(ctrl.get('title'), null);
        assert.equal(ctrl.get('titleValid'), null);
        ctrl.send('discardUploadChanges');
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('selectedFile.id'), file.id);
        assert.equal(ctrl.get('title'), 'hello');
        assert.equal(ctrl.get('titleValid'), true);
    });
});

test('clearDownstreamFields action - belowConvertOrCopy', function(assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
        });

        ctrl.set('model', preprint);
        ctrl.set('selectedFile', 'Test file');
        ctrl.set('file', 'file');
        ctrl.set('convertOrCopy', 'copy');
        ctrl.set('title', 'Test title');

        ctrl.send('clearDownstreamFields', 'belowConvertOrCopy');

        assert.equal(ctrl.get('model'), preprint);
        assert.equal(ctrl.get('selectedFile'), 'Test file');
        assert.equal(ctrl.get('file'), 'file');
        assert.equal(ctrl.get('convertOrCopy'), 'copy');
        assert.equal(ctrl.get('title'), null);
    });
});

test('clearDownstreamFields action - belowFile', function(assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
        });

        ctrl.set('model', preprint);
        ctrl.set('selectedFile', 'Test file');
        ctrl.set('file', 'file');
        ctrl.set('convertOrCopy', 'copy');
        ctrl.set('title', 'Test title');

        ctrl.send('clearDownstreamFields', 'belowFile');

        assert.equal(ctrl.get('model'), preprint);
        assert.equal(ctrl.get('selectedFile'), 'Test file');
        assert.equal(ctrl.get('file'), 'file');
        assert.equal(ctrl.get('convertOrCopy'), null);
        assert.equal(ctrl.get('title'), null);
    });
});

test('clearDownstreamFields action - belowNode', function(assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
        });

        ctrl.set('model', preprint);
        ctrl.set('selectedFile', 'Test file');
        ctrl.set('file', 'file');
        ctrl.set('convertOrCopy', 'copy');
        ctrl.set('title', 'Test title');

        ctrl.send('clearDownstreamFields', 'belowNode');

        assert.equal(ctrl.get('model'), preprint);
        assert.equal(ctrl.get('selectedFile'), null);
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('convertOrCopy'), null);
        assert.equal(ctrl.get('title'), null);
    });
});

test('clearDownstreamFields action - allUpload', function(assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
        });

        ctrl.set('model', preprint);
        ctrl.set('selectedFile', 'Test file');
        ctrl.set('file', 'file');
        ctrl.set('convertOrCopy', 'copy');
        ctrl.set('title', 'Test title');

        ctrl.send('clearDownstreamFields', 'allUpload');

        assert.equal(ctrl.get('selectedFile'), null);
        assert.equal(ctrl.get('file'), null);
        assert.equal(ctrl.get('convertOrCopy'), null);
        assert.equal(ctrl.get('title'), null);
    });
});

test('discardBasics', function(assert) {
    // assert.expect(4);
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
            tags: ['first tag'],
            description: 'The best abstract',
            doi: '10.1234/test_doi',
            licenseRecord: {
                year: '2016',
                copyright_holders: ['Amelia Earhart'],
            },
            license: 'No License',
            originalPublicationDate: moment(),
        });

        ctrl.set('model', preprint);
        ctrl.set('basicsTags', ['second Tag']);
        ctrl.set('basicsAbstract', 'Test abstract');
        ctrl.set('basicsDOI', null);
        ctrl.set('basicsLicense', 'Test license');
        ctrl.set('basicsOriginalPublicationDate', moment().add(1, 'days'));
        ctrl.send('discardBasics');
        assert.equal(ctrl.get('basicsTags')[0], preprint.get('tags')[0]);
        assert.equal(ctrl.get('basicsAbstract'), preprint.get('description'));
        assert.equal(ctrl.get('basicsDOI'), preprint.get('doi'));
        assert.equal(ctrl.get('basicsOriginalPublicationDate'), preprint.get('originalPublicationDate'));
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

skip('saveBasics', function(assert) {
    this.inject.service('store');
    const { store } = this;
    const ctrl = this.subject();
    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'hello',
            tags: ['tags'],
            description: 'This is an abstract.',
            primaryFile: 'Test file',
            doi: '10.1234/test',
        });
        ctrl.set('model', preprint);
        ctrl.send('saveBasics');
        run.cancelTimers();
        assert.ok('?');
    });
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
    ctrl.send('removeTag', 1);
    assert.equal(ctrl.get('basicsTags').length, 1);
    assert.equal(ctrl.get('basicsTags')[0], 'firstTag');
});

skip('discardSubjects', function() {
    // TODO
});

skip('saveSubjects', function() {
    // TODO
});

skip('findContributors', function() {
    // TODO
});

skip('highlightSuccessOrFailure', function() {
    // TODO
});

test('clickSubmit', function(assert) {
    const ctrl = this.subject();
    assert.equal(ctrl.get('showModalSharePreprint'), false, 'showModalSharePreprint initial value');
    assert.equal(ctrl.get('attemptedSubmit'), false, 'attemptedSubmit initial value');
    assert.equal(ctrl.get('showValidationErrors'), false, 'showValidationErrors initial value');
    assert.equal(ctrl.get('allSectionsValid'), false, 'allSectionsValid initial value');

    ctrl.send('clickSubmit');

    assert.equal(ctrl.get('showModalSharePreprint'), false, 'showModalSharePreprint after failed submit');
    assert.equal(ctrl.get('attemptedSubmit'), true, 'attemptedSubmit after failed submit');
    assert.equal(ctrl.get('showValidationErrors'), true, 'showValidationErrors after failed submit');
    assert.equal(ctrl.get('allSectionsValid'), false, 'allSectionsValid after failed submit');

    ctrl.set('allSectionsValid', true);
    ctrl.send('clickSubmit');

    assert.equal(ctrl.get('showModalSharePreprint'), true, 'showModalSharePreprint after valid submit');
    assert.equal(ctrl.get('showValidationErrors'), false, 'showValidationErrors after valid submit');
});

skip('savePreprint', function() {
    // TODO
});

test('selectProvider', function(assert) {
    const ctrl = this.subject();
    this.inject.service('store');

    run(() => {
        const provider = this.store.createRecord('preprint-provider');

        ctrl.set('provider', provider);
        ctrl.send('selectProvider');

        assert.strictEqual(ctrl.get('providerChanged'), true);
    });
});

test('cancel', function(assert) {
    const ctrl = this.subject();

    ctrl.set('transitionToRoute', () => {});
    const stub = this.stub(ctrl, 'transitionToRoute');

    ctrl.send('cancel');
    assert.ok(stub.calledOnce);

    assert.ok(stub.calledWithExactly('index'));
});

test('returnToSubmission', function(assert) {
    const ctrl = this.subject();

    ctrl.set('transitionToRoute', () => {});
    const stub = this.stub(ctrl, 'transitionToRoute');

    ctrl.send('cancel');
    assert.ok(stub.calledOnce);
});
