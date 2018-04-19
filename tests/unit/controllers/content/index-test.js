import { run } from '@ember/runloop';
import { moduleFor, test, skip } from 'ember-qunit';
import config from 'ember-get-config';
import trunc from 'npm:unicode-byte-truncate';

moduleFor('controller:content/index', 'Unit | Controller | content/index', {
    needs: [
        'model:review-action',
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
        'model:wiki',
        'model:taxonomy',
        'service:metrics',
        'service:theme',
        'service:session',
        'service:currentUser',
    ],
});

test('Initial properties', function (assert) {
    const ctrl = this.subject();

    const expected = {
        fullScreenMFR: false,
        showLicenseText: false,
        activeFile: null,
        chosenFile: null,
    };

    const propKeys = Object.keys(expected);
    const actual = ctrl.getProperties(propKeys);

    assert.ok(propKeys.every(key => expected[key] === actual[key]));
});

test('isAdmin computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const node = store.createRecord('node', {
            currentUserPermissions: ['admin'],
        });

        assert.strictEqual(ctrl.get('isAdmin'), false);

        ctrl.set('node', node);

        assert.strictEqual(ctrl.get('isAdmin'), true);
    });
});

test('twitterHref computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'test title',
        });

        ctrl.set('model', preprint);

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('twitterHref'),
            `https://twitter.com/intent/tweet?url=${location}&text=test%20title&via=OSFramework`,
        );
    });
});

test('facebookHref computed property - has facebookAppId', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();
    const facebookAppId = 112233445566;

    run(() => {
        const provider = store.createRecord('preprint-provider', {
            facebookAppId,
        });

        const model = store.createRecord('preprint', {
            provider,
        });

        ctrl.setProperties({ model });

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('facebookHref'),
            `https://www.facebook.com/dialog/share?app_id=${facebookAppId.toString()}&display=popup&href=${location}&redirect_uri=${location}`,
        );
    });
});

test('facebookHref computed property - does not have facebookAppId', function(assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const provider = store.createRecord('preprint-provider', {
            facebookAppId: '',
        });

        const model = store.createRecord('preprint', {
            provider,
        });

        ctrl.setProperties({ model });

        const { FB_APP_ID } = config;
        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('facebookHref'),
            `https://www.facebook.com/dialog/share?app_id=${FB_APP_ID}&display=popup&href=${location}&redirect_uri=${location}`,
        );
    });
});

test('linkedinHref computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'test title',
            description: 'test description',
        });

        ctrl.set('model', preprint);

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('linkedinHref'),
            `https://www.linkedin.com/shareArticle?url=${location}&mini=true&title=test%20title&summary=test%20description&source=Open%20Science%20Framework`,
        );
    });
});

test('trunc() works properly: only unicode', function (assert) {
    // Each Chinese characters is 3 bytes long in Unicode.
    const unicodeString = '上下而求索';
    const expectedTruncatedString = '上下';
    assert.strictEqual(trunc(unicodeString, 6), expectedTruncatedString);
    assert.strictEqual(trunc(unicodeString, 7), expectedTruncatedString);
    assert.strictEqual(trunc(unicodeString, 8), expectedTruncatedString);
});

test('trunc() works properly: only ASCII', function (assert) {
    const asciiString = 'ascii string';
    assert.strictEqual(trunc(asciiString, 5), 'ascii');
    assert.strictEqual(trunc(asciiString, 6), 'ascii ');
    assert.strictEqual(trunc(asciiString, 7), 'ascii s');
});

test('trunc() works properly: ASCII and Unicode', function (assert) {
    const unicodeString = 'Open Science 开放科学';
    assert.strictEqual(trunc(unicodeString, 13), 'Open Science ');
    assert.strictEqual(trunc(unicodeString, 14), 'Open Science ');
    assert.strictEqual(trunc(unicodeString, 15), 'Open Science ');
    assert.strictEqual(trunc(unicodeString, 16), 'Open Science 开');
    assert.strictEqual(trunc(unicodeString, 17), 'Open Science 开');
    assert.strictEqual(trunc(unicodeString, 18), 'Open Science 开');
    assert.strictEqual(trunc(unicodeString, 19), 'Open Science 开放');
});

test('emailHref computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            title: 'test title',
        });

        ctrl.set('model', preprint);

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('emailHref'),
            `mailto:?subject=test%20title&body=${location}`,
        );
    });
});

test('hasTag computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            tags: [],
        });

        ctrl.set('model', preprint);

        assert.strictEqual(
            ctrl.get('hasTag'),
            false,
        );
    });

    run(() => {
        const preprint = store.createRecord('preprint', {
            tags: ['a', 'b', 'c'],
        });

        ctrl.set('model', preprint);

        assert.strictEqual(
            ctrl.get('hasTag'),
            true,
        );
    });
});

// TODO: unskip test when loadAll() is removed/refactored.
skip('authors computed property', function (assert) {
    assert.expect(1);
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            id: 'abc12',
        });

        ctrl.set('model', preprint);

        // TODO figure out how to test with at least one contributor
        // ctrl.get('authors')
        //     .then((authors) => {
        //         assert.strictEqual(authors.length, 0);
        //     });
    });
});

test('fullLicenseText computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const license = store.createRecord('license', {
            text: 'The year is {{year}} and the copyright holders are {{copyrightHolders}}.',
        });

        const model = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2000',
                copyright_holders: [
                    'Annie Anderson',
                    'Bobby Buckner',
                    'Charlie Carson',
                ],
            },
        });

        ctrl.setProperties({ model });

        assert.strictEqual(
            ctrl.get('fullLicenseText'),
            'The year is 2000 and the copyright holders are Annie Anderson, Bobby Buckner, Charlie Carson.',
        );
    });

    run(() => {
        const license = store.createRecord('license', {
            text: 'The year is {{year}}.',
        });

        const model = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2000',
            },
        });

        ctrl.setProperties({ model });

        assert.strictEqual(
            ctrl.get('fullLicenseText'),
            'The year is 2000.',
        );
    });
});

test('editButtonLabel computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const provider = store.createRecord('preprint-provider', {
            reviewsWorkflow: 'pre-moderation',
        });

        const model = store.createRecord('preprint', {
            provider,
            reviewsState: 'initial',
        });

        ctrl.setProperties({ model });

        const workflowTypes = ['pre-moderation', 'post-moderation'];
        const stateTypes = ['pending', 'accepted', 'rejected'];
        for (let i = 0; i < workflowTypes.length; i++) {
            for (let j = 0; j < stateTypes.length; j++) {
                ctrl.set('model.provider.reviewsWorkflow', workflowTypes[i]);
                ctrl.set('model.reviewsState', stateTypes[j]);
                if (workflowTypes[i] === 'pre-moderation' && stateTypes[j] === 'rejected') {
                    assert.strictEqual(ctrl.get('editButtonLabel'), 'content.project_button.edit_resubmit_preprint');
                } else {
                    assert.strictEqual(ctrl.get('editButtonLabel'), 'content.project_button.edit_preprint');
                }
            }
        }
    });
});

test('hasShortenedDescription computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const preprint = store.createRecord('preprint', {
            description: 'Lorem ipsum',
        });
        ctrl.set('model', preprint);

        assert.strictEqual(
            ctrl.get('hasShortenedDescription'),
            false,
        );
    });

    run(() => {
        const preprint = store.createRecord('preprint', {
            description: 'Lorem ipsum'.repeat(35),
        });

        ctrl.set('model', preprint);

        assert.strictEqual(
            ctrl.get('hasShortenedDescription'),
            true,
        );
    });
});

test('useShortenedDescription computed property', function (assert) {
    const ctrl = this.subject();

    const scenarios = [
        [false, true, true],
        [true, true, false],
        [false, false, false],
        [true, false, false],
    ];

    for (const [expandedAbstract, hasShortenedDescription, expected] of scenarios) {
        ctrl.setProperties({
            expandedAbstract,
            hasShortenedDescription,
        });

        assert.strictEqual(ctrl.get('useShortenedDescription'), expected);
    }
});

test('description computed property', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const input = 'Lorem ipsum dolor sit amet, atqui elitr id vim, at clita facilis tibique ius, ad pro stet accusam. Laudem essent commune ea vix. Duis hendrerit complectitur usu eu, ei nam ullum accusamus inciderint, has appetere assueverit te. An pro maiorum alienum voluptatibus, mei adhuc docendi prodesset in. Ut vel mundi atomorum quaerendum, cu per autem menandri consequat, tantas dictas quodsi nec eu. Ornatus forensibus vituperatoribus id vix.';
        const expected = 'Lorem ipsum dolor sit amet, atqui elitr id vim, at clita facilis tibique ius, ad pro stet accusam. Laudem essent commune ea vix. Duis hendrerit complectitur usu eu, ei nam ullum accusamus inciderint, has appetere assueverit te. An pro maiorum alienum voluptatibus, mei adhuc docendi prodesset in. Ut vel mundi atomorum quaerendum, cu per autem';

        const preprint = store.createRecord('preprint', {
            description: input,
        });

        ctrl.set('model', preprint);

        assert.strictEqual(
            ctrl.get('description'),
            expected,
        );
    });
});

test('toggleLicenseText action', function (assert) {
    const ctrl = this.subject();
    const initialValue = ctrl.get('showLicenseText');

    ctrl.send('toggleLicenseText');
    assert.strictEqual(ctrl.get('showLicenseText'), !initialValue);

    ctrl.send('toggleLicenseText');
    assert.strictEqual(ctrl.get('showLicenseText'), initialValue);
});

test('expandMFR action', function (assert) {
    const ctrl = this.subject();
    const initialValue = ctrl.get('fullScreenMFR');

    ctrl.send('expandMFR');
    assert.strictEqual(ctrl.get('fullScreenMFR'), !initialValue);

    ctrl.send('expandMFR');
    assert.strictEqual(ctrl.get('fullScreenMFR'), initialValue);
});

test('expandAbstract action', function (assert) {
    const ctrl = this.subject();
    const initialValue = ctrl.get('expandedAbstract');

    ctrl.send('expandAbstract');
    assert.strictEqual(ctrl.get('expandedAbstract'), !initialValue);

    ctrl.send('expandAbstract');
    assert.strictEqual(ctrl.get('expandedAbstract'), initialValue);
});

test('chooseFile action', function (assert) {
    this.inject.service('store');

    const { store } = this;
    const ctrl = this.subject();

    run(() => {
        const fileItem = store.createRecord('file', {
            id: 'test1',
        });

        ctrl.send('chooseFile', fileItem);
        assert.strictEqual(ctrl.get('chosenFile'), 'test1');
        assert.strictEqual(ctrl.get('activeFile'), fileItem);
    });
});

// Don't try to test shareLink, since it includes a window.open call. No good way to test that.
