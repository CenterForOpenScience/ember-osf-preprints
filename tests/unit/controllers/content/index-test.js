import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import config from 'ember-get-config';

moduleFor('controller:content/index', 'Unit | Controller | content/index', {
    needs: [
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
        'service:metrics',
        'service:theme'
    ]
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

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            currentUserPermissions: ['admin']
        });

        assert.strictEqual(ctrl.get('isAdmin'), false);

        ctrl.set('node', node);

        assert.strictEqual(ctrl.get('isAdmin'), true);
    });
});

test('twitterHref computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            title: 'test title'
        });

        ctrl.setProperties({node});

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('twitterHref'),
            `https://twitter.com/intent/tweet?url=${location}&text=test%20title&via=OSFramework`
        );
    });
});

test('facebookHref computed property', function (assert) {
    const ctrl = this.subject();

    const {FB_APP_ID} = config;
    const location = encodeURIComponent(window.location.href);

    assert.strictEqual(
        ctrl.get('facebookHref'),
        `https://www.facebook.com/dialog/share?app_id=${FB_APP_ID}&display=popup&href=${location}&redirect_uri=${location}`
    );
});

test('linkedinHref computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            title: 'test title',
            description: 'test description'
        });

        ctrl.setProperties({node});

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('linkedinHref'),
            `https://www.linkedin.com/shareArticle?url=${location}&mini=true&title=test%20title&summary=test%20description&source=Open%20Science%20Framework`
        );
    });
});

test('emailHref computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            title: 'test title'
        });

        ctrl.setProperties({node});

        const location = encodeURIComponent(window.location.href);

        assert.strictEqual(
            ctrl.get('emailHref'),
            `mailto:?subject=test%20title&body=${location}`
        );
    });
});

test('hasTag computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            tags: []
        });

        ctrl.setProperties({node});

        assert.strictEqual(
            ctrl.get('hasTag'),
            false
        );
    });

    Ember.run(() => {
        const node = store.createRecord('node', {
            tags: ['a', 'b', 'c']
        });

        ctrl.setProperties({node});

        assert.strictEqual(
            ctrl.get('hasTag'),
            true
        );
    });
});

test('authors computed property', function (assert) {
    assert.expect(1);
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            id: 'abc12'
        });

        ctrl.setProperties({
            node
        });

        // TODO figure out how to test with at least one contributor
        ctrl.get('authors')
            .then(authors => {
                assert.strictEqual(authors.length, 0);
            });
    });
});

test('doiUrl computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const model = store.createRecord('preprint', {
            doi: '10.1037/rmh0000008'
        });

        ctrl.setProperties({model});

        assert.strictEqual(
            ctrl.get('doiUrl'),
            'https://dx.doi.org/10.1037/rmh0000008'
        );
    });
});

test('fullLicenseText computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const license = store.createRecord('license', {
            text: 'The year is {{year}} and the copyright holders are {{copyrightHolders}}.'
        });

        const model = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2000',
                copyright_holders: [
                    'Annie Anderson',
                    'Bobby Buckner',
                    'Charlie Carson'
                ]
            }
        });

        ctrl.setProperties({model});

        assert.strictEqual(
            ctrl.get('fullLicenseText'),
            'The year is 2000 and the copyright holders are Annie Anderson, Bobby Buckner, Charlie Carson.'
        );
    });

    Ember.run(() => {
        const license = store.createRecord('license', {
            text: 'The year is {{year}}.'
        });

        const model = store.createRecord('preprint', {
            license,
            licenseRecord: {
                year: '2000'
            }
        });

        ctrl.setProperties({model});

        assert.strictEqual(
            ctrl.get('fullLicenseText'),
            'The year is 2000.'
        );
    });
});

test('hasShortenedDescription computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const node = store.createRecord('node', {
            description: 'Lorem ipsum'
        });

        ctrl.setProperties({node});

        assert.strictEqual(
            ctrl.get('hasShortenedDescription'),
            false
        );
    });

    Ember.run(() => {
        const node = store.createRecord('node', {
            description: 'Lorem ipsum'.repeat(35)
        });

        ctrl.setProperties({node});

        assert.strictEqual(
            ctrl.get('hasShortenedDescription'),
            true
        );
    });
});

test('useShortenedDescription computed property', function (assert) {
    const ctrl = this.subject();

    const scenarios = [
        [false, true, true],
        [true, true, false],
        [false, false, false],
        [true, false, false]
    ];

    for (const [expandedAbstract, hasShortenedDescription, expected] of scenarios) {
        ctrl.setProperties({
            expandedAbstract,
            hasShortenedDescription
        });

        assert.strictEqual(ctrl.get('useShortenedDescription'), expected);
    }
});

test('description computed property', function (assert) {
    this.inject.service('store');

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const input = 'Lorem ipsum dolor sit amet, atqui elitr id vim, at clita facilis tibique ius, ad pro stet accusam. Laudem essent commune ea vix. Duis hendrerit complectitur usu eu, ei nam ullum accusamus inciderint, has appetere assueverit te. An pro maiorum alienum voluptatibus, mei adhuc docendi prodesset in. Ut vel mundi atomorum quaerendum, cu per autem menandri consequat, tantas dictas quodsi nec eu. Ornatus forensibus vituperatoribus id vix.';
        const expected ='Lorem ipsum dolor sit amet, atqui elitr id vim, at clita facilis tibique ius, ad pro stet accusam. Laudem essent commune ea vix. Duis hendrerit complectitur usu eu, ei nam ullum accusamus inciderint, has appetere assueverit te. An pro maiorum alienum voluptatibus, mei adhuc docendi prodesset in. Ut vel mundi atomorum quaerendum, cu per autem';

        const node = store.createRecord('node', {
            description: input
        });

        ctrl.setProperties({node});

        assert.strictEqual(
            ctrl.get('description'),
            expected
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

    const store = this.store;
    const ctrl = this.subject();

    Ember.run(() => {
        const fileItem = store.createRecord('file', {
            id: 'test1'
        });

        ctrl.send('chooseFile', fileItem);
        assert.strictEqual(ctrl.get('chosenFile'), 'test1');
        assert.strictEqual(ctrl.get('activeFile'), fileItem);
    });
});

// Don't try to test shareLink, since it includes a window.open call. No good way to test that.
