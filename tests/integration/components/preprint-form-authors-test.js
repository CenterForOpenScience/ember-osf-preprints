import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

moduleForComponent('preprint-form-authors', 'Integration | Component | preprint form authors', {
    integration: true,
    beforeEach() {
        const preprint = EmberObject.create({
            dateModified: '10-11-2016',
            title: 'My Preprint Title',
            provider: 'osf',
            id: 890,
        });
        const contrib1 = EmberObject.create({
            id: '12345',
            userId: '12345',
            permission: 'admin',
            bibliographic: true,
            unregisteredContributor: null,
            users: EmberObject.create({
                fullName: 'Marie Curie',
            }),
        });
        const contrib2 = EmberObject.create({
            id: 'abcde',
            userId: 'abcde',
            permission: 'write',
            bibliographic: true,
            unregisteredContributor: null,
            users: EmberObject.create({
                fullName: 'Rosalind Franklin',
            }),
        });
        const contrib3 = EmberObject.create({
            id: 'ghijk',
            userId: 'ghijk',
            permission: 'read',
            bibliographic: false,
            unregisteredContributor: null,
            users: EmberObject.create({
                fullName: 'Dorothy Hodgkin',
            }),
        });
        const contributors = [contrib1, contrib2, contrib3];
        this.set('contrib1', contrib1);
        this.set('contrib2', contrib2);
        this.set('contrib3', contrib3);
        this.set('contributors', contributors);
        this.set('isAdmin', true);
        this.set('currentUser', contrib1);
        this.set('editMode', false);
        this.set('canEdit', true);
        this.set('model', preprint);
    },
});
test('preprint-form-authors renders', function(assert) {
    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('.vert-align-contributor-name')[0].innerText.trim(), 'Marie Curie');
    assert.equal($('.vert-align-contributor-name')[1].innerText.trim(), 'Rosalind Franklin');
    assert.equal($('.vert-align-contributor-name')[2].innerText.trim(), 'Dorothy Hodgkin');

    assert.equal($('span.text-smaller')[0].innerText, 'Administrator');
    assert.equal($('select.permission-select')[0].value, 'write');
    assert.equal($('select.permission-select')[1].value, 'read');
    assert.equal($('select.permission-select')[0].disabled, false);
    assert.equal($('select.permission-select')[1].disabled, false);

    assert.equal($('input[name=bibliographic]')[0].checked, true);
    assert.equal($('input[name=bibliographic]')[1].checked, true);
    assert.equal($('input[name=bibliographic]')[2].checked, false);

    assert.equal($('input[name=bibliographic]')[0].disabled, false);
    assert.equal($('input[name=bibliographic]')[1].disabled, false);
    assert.equal($('input[name=bibliographic]')[2].disabled, false);
});

test('preprint-form-authors admin cannot remove self on submit', function(assert) {
    this.set('contrib2.permission', 'admin');
    this.set('contributors', [this.get('contrib1'), this.get('contrib2'), this.get('contrib3')]);

    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('span.text-smaller')[0].innerText, 'Administrator');
    assert.equal($('select.permission-select')[0].value, 'admin');
    assert.equal($('select.permission-select')[1].value, 'read');
});

test('preprint-form-authors admin can remove self on edit', function(assert) {
    this.set('contrib2.permission', 'admin');
    this.set('contributors', [this.get('contrib1'), this.get('contrib2'), this.get('contrib3')]);
    this.set('editMode', true);

    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('select.permission-select')[0].value, 'admin');
    assert.equal($('select.permission-select')[1].value, 'admin');
    assert.equal($('select.permission-select')[2].value, 'read');
});

test('preprint-form-authors write can remove themselves but not edit', function(assert) {
    this.set('editMode', true);
    this.set('isAdmin', false);
    this.set('currentUser', this.get('contrib2'));

    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('span.text-smaller')[0].innerText, 'Administrator');
    assert.equal($('span.text-smaller')[1].innerText, 'Read + Write');
    assert.equal($('span.text-smaller')[2].innerText, 'Read');

    assert.equal($('input[name=bibliographic]')[0].disabled, true);
    assert.equal($('input[name=bibliographic]')[1].disabled, true);
    assert.equal($('input[name=bibliographic]')[2].disabled, true);

    assert.equal($('button.btn-danger')[0].classList.contains('disabled'), true);
    assert.equal($('button.btn-danger')[1].classList.contains('disabled'), false);
    assert.equal($('button.btn-danger')[2].classList.contains('disabled'), true);
});

test('preprint-form-authors read can remove themselves but not edit', function(assert) {
    this.set('editMode', true);
    this.set('isAdmin', false);
    this.set('currentUser', this.get('contrib3'));

    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('span.text-smaller')[0].innerText, 'Administrator');
    assert.equal($('span.text-smaller')[1].innerText, 'Read + Write');
    assert.equal($('span.text-smaller')[2].innerText, 'Read');

    assert.equal($('input[name=bibliographic]')[0].disabled, true);
    assert.equal($('input[name=bibliographic]')[1].disabled, true);
    assert.equal($('input[name=bibliographic]')[2].disabled, true);

    assert.equal($('button.btn-danger')[0].classList.contains('disabled'), true);
    assert.equal($('button.btn-danger')[1].classList.contains('disabled'), true);
    assert.equal($('button.btn-danger')[2].classList.contains('disabled'), false);
});

test('preprint-form-authors cannot remove last admin or bibliographic', function(assert) {
    this.set('editMode', true);
    this.set('contrib1.bibliographic', false);

    this.render(hbs`{{preprint-form-authors
        contributors=contributors
        model=model
        isAdmin=isAdmin
        currentUser=currentUser
        editMode=editMode
        canEdit=canEdit
    }}`);

    assert.equal($('span.text-smaller')[0].innerText, 'Administrator');
    assert.equal($('select.permission-select')[0].value, 'write');
    assert.equal($('select.permission-select')[1].value, 'read');

    assert.equal($('input[name=bibliographic]')[0].disabled, false);
    assert.equal($('input[name=bibliographic]')[1].disabled, true);
    assert.equal($('input[name=bibliographic]')[2].disabled, false);

    assert.equal($('button.btn-danger')[0].classList.contains('disabled'), true);
    assert.equal($('button.btn-danger')[1].classList.contains('disabled'), true);
    assert.equal($('button.btn-danger')[2].classList.contains('disabled'), false);
});
