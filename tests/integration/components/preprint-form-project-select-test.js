import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-project-select', 'Integration | Component | preprint form project select', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  let noop = () => {};
  this.set('noop', noop);

  this.render(hbs`{{preprint-form-project-select
                    existingNodeExistingFile=(action noop)
                    changeState=(action noop)
                    finishUpload=(action noop)
                    createComponentCopyFile=(action noop)
                    highlightSuccessOrFailure=(action noop)}}  
  }}`);
  assert.equal(this.$('p.text-muted').text().trim(), 'The list of projects appearing in the selector are projects and components for which you have admin access.  Deleted projects and registrations are not included here.');

});
