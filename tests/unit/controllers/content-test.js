import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';


moduleFor('controller:content', 'Unit | Controller | content', {
    needs: ['service:metrics', 'service:theme', 'model:file', 'model:preprint',
            'model:preprint-provider', 'model:node', 'model:license',
            'model:user', 'model:citation', 'model:draft-registration',
            'model:contributor', 'model:comment', 'model:institution',
            'model:registration', 'model:file-provider', 'model:log',
            'model:node-link', 'model:wiki'],
    beforeEach: function() {
        manualSetup(this.container);
    }
});

// Replace this with your real tests.
test('it exists', function(assert) {
    let controller = this.subject();
    assert.ok(controller);
});

test('fullLicenseText computed property with multiple copyright holders and year', function(assert) {
    let ctrl = this.subject();
    let preprint = FactoryGuy.make('preprint');
    let license = preprint.get('license');
    Ember.run(() => {
        ctrl.set('model', preprint);
        license.set('text', 'On {{year}}, for {{copyrightHolders}}');
        preprint.set('licenseRecord',  {
            year: '2001',
            copyright_holders: ['Henrique', 'Someone Else']
        });
        assert.equal(ctrl.get('fullLicenseText'), 'On 2001, for Henrique, Someone Else');
    });
});

test('fullLicenseText computed property with no copyright holders or year', function(assert) {
    let ctrl = this.subject();
    let preprint = FactoryGuy.make('preprint');
    let license = preprint.get('license');
    Ember.run(() => {
        ctrl.set('model', preprint);
        license.set('text', 'On {{year}}, for {{copyrightHolders}}');
        preprint.set('licenseRecord',  {
            year: '',
            copyright_holders: []
        });

        assert.equal(ctrl.get('fullLicenseText'), 'On , for ');
    });
});
test('fullLicenseText computed property with {{}} for copyrightHolders', function(assert) {
    let ctrl = this.subject();
    let preprint = FactoryGuy.make('preprint');
    let license = preprint.get('license');
    Ember.run(() => {
        ctrl.set('model', preprint);
        license.set('text', 'On {{year}}, for {{copyrightHolders}}');
        preprint.set('licenseRecord',  {
            year: '{{year}}',
            copyright_holders: ['{{copyrightHolders}}']
        });

        assert.equal(ctrl.get('fullLicenseText'), 'On {{year}}, for {{copyrightHolders}}');
    });
});

test('useShortenedDescription computed property', function(assert) {
    let ctrl = this.subject();
    let node = FactoryGuy.make('node');
    Ember.run(() => {
        ctrl.set('node', node);

        node.set('description', 'string'.repeat(100).slice(0, 351));
        assert.ok(ctrl.get('useShortenedDescription'));

        node.set('description', 'string'.repeat(100).slice(0, 350));
        assert.ok(!ctrl.get('useShortenedDescription'));

        node.set('description', 'string'.repeat(100).slice(0, 349));
        assert.ok(!ctrl.get('useShortenedDescription'));
    });
});

test('description computed property', function(assert) {
    let ctrl = this.subject();
    let node = FactoryGuy.make('node');
    Ember.run(() => {
        ctrl.set('node', node);
        ctrl.set('expandedAbstract', false);

        //Test cut at 350 characters
        let description = 'string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string str';
        let notExpanded = description.slice(0, 350);
        node.set('description', description);
        assert.equal(ctrl.get('description'), notExpanded.trim());

        //Test cut at less than 350 characters to not cut in middle of word
        description = 'string stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring';
        notExpanded = 'string ';
        node.set('description', description);
        assert.equal(ctrl.get('description'), notExpanded.trim());
    });
});
