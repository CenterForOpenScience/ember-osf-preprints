import Ember from 'ember';
import { moduleForComponent, test, skip } from 'ember-qunit';

import Permissions from 'ember-osf/const/permissions';

moduleForComponent('preprint-form-project-select', 'Integration | Component | preprint form project select', {
    integration: true,
    beforeEach: function() {
        let noop = () => {};
        this.set('noop', noop);
    }
});

const componentRoot = `preprint-form-project-select
    existingNodeExistingFile=(action noop)
    changeInitialState=(action noop)
    finishUpload=(action noop)
    createComponentCopyFile=(action noop)
    highlightSuccessOrFailure=(action noop)`;

test('it renders', function(assert) {
    let component = Ember.HTMLBars.compile(`{{${componentRoot}}}`);
    this.render(component);
    assert.equal(this.$('p.text-muted').text().trim(), 'The list of projects appearing in the selector are projects and components for which you have admin access.  Registrations are not included here.');
});

test('isAdmin computed to false shows warning', function(assert) {
    let component = `{{
        ${componentRoot}
        selectedNode=selectedNode
        nodeLocked=true
    }}`;
    this.set('selectedNode', {
        currentUserPermissions: [Permissions.ADMIN]
    });
    this.render(component);
    assert.ok(!this.$('.alert-danger').length);

    this.set('selectedNode', {
        currentUserPermissions: []
    });
    this.render(component);
    assert.ok(this.$('.alert-danger').length);
});

skip('choosing a project locks the node', function() {
    //TODO: Needs factories to work properly, as do more tests checking the changing
    //states in this component, dependant on https://github.com/CenterForOpenScience/ember-preprints/pull/293/files
    test('choosing a project locks the node', function(assert) {
        let component = `{{
            ${componentRoot}
            userNodesLoaded=true
            userNodes=userNodes
        }}`;
        this.render(component);
        assert.ok(this.$());
    });
});
