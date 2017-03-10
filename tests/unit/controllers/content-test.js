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

test('fullLicenseText computed property', function(assert) {
    let ctrl = this.subject();
    let preprint = FactoryGuy.make('preprint');
    let license = preprint.get('license');
    ctrl.set('model', preprint);
    license.set('text', 'On {{year}}, for {{copyrightHolders}}');

    preprint.set('licenseRecord',  {
        year: '2001',
        copyright_holders: ['Henrique', 'Someone Else']
    });
    ctrl.notifyPropertyChange('model.license');
    assert.equal(ctrl.get('fullLicenseText'), 'On 2001, for Henrique,Someone Else');

    preprint.set('licenseRecord',  {
        year: '',
        copyright_holders: []
    });
    ctrl.notifyPropertyChange('model.license');
    assert.equal(ctrl.get('fullLicenseText'), 'On , for ');

    preprint.set('licenseRecord',  {
        year: '{{year}}',
        copyright_holders: ['{{copyrightHolders}}']
    });
    ctrl.notifyPropertyChange('model.license');
    assert.equal(ctrl.get('fullLicenseText'), 'On {{year}}, for {{copyrightHolders}}');
});

test('useShortenedDescription computed property', function(assert) {
    let ctrl = this.subject();
    let node = FactoryGuy.make('node');
    ctrl.set('node', node);
    Ember.run(() => {
        node.set('description', 'string'.repeat(100).slice(0, 351));
        ctrl.notifyPropertyChange('node.description');
        assert.ok(ctrl.get('useShortenedDescription'));

        node.set('description', 'string'.repeat(100).slice(0, 350));
        ctrl.notifyPropertyChange('node.description');
        assert.ok(!ctrl.get('useShortenedDescription'));

        node.set('description', 'string'.repeat(100).slice(0, 349));
        ctrl.notifyPropertyChange('node.description');
        assert.ok(!ctrl.get('useShortenedDescription'));
    });
});

test('description computed property', function(assert) {
    Ember.run(() => {
        let ctrl = this.subject();
        let node = FactoryGuy.make('node');
        ctrl.set('node', node);
        ctrl.set('expandedAbstract', false);

        //Test cut at 350 characters
        let description = 'string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string str';
        let notExpanded = description.slice(0, 350) + '...';
        node.set('description', description);
        ctrl.notifyPropertyChange('description');
        assert.equal(ctrl.get('description'), notExpanded);

        //Test cut at less than 350 characters to not cut in middle of word
        description = 'string stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring';
        notExpanded = 'string ...';
        node.set('description', description);
        ctrl.notifyPropertyChange('description');
        assert.equal(ctrl.get('description'), notExpanded);

        //Test less than 350 doesn't use description (uses node.description)

        ctrl.set('expandedAbstract', true);

        description = 'string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string string str';
        node.set('description', description);
        ctrl.notifyPropertyChange('description');
        assert.equal(ctrl.get('description'), description);

        description = 'string stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring';
        node.set('description', description);
        ctrl.notifyPropertyChange('description');
        assert.equal(ctrl.get('description'), description);
    });
});
