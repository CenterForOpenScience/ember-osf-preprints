import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('unregistered-contributor-form', 'Integration | Component | unregistered contributor form', {
    integration: true,
});

const noop = () => {};

test('form renders', function(assert) {
    // Tests that the unregistered-contirbutor form renders

    this.set('resetfindContributorsView', noop);
    this.set('addUnregisteredContributor', noop);
    this.render(hbs`{{unregistered-contributor-form
                       resetfindContributorsView=resetfindContributorsView
                       addUnregisteredContributor=addUnregisteredContributor}}`);


    assert.equal(this.$('label')[0].textContent.trim(), 'Full Name');
    assert.equal(this.$('label')[1].textContent.trim(), 'Email');
    assert.equal(this.$('p').text(), 'We will notify the user that they have been added to your .'); // preprint words needs to be run with ember osf
    assert.equal(this.$('button')[0].textContent.trim(), 'Cancel');
    assert.equal(this.$('button')[1].textContent.trim(), 'Add');
});

test('cancel unregistered contributor form', function(assert) {
    // Tests that the cancel button properly works to reset the contributor form

    this.set('resetfindContributorsView', function() {
        this.$('input[name=fullName]').val('');
        this.$('input[name=username]').val('');
    });
    this.set('addUnregisteredContributor', noop);
    this.set('model', this);
    this.set('valuePath', 'username');
    this.set('placeholder', 'Email');
    this.set('value', '');

    // Renders the handlebars template with variables for inline 'validated-input' component
    this.render(hbs`{{unregistered-contributor-form
                        resetfindContributorsView=resetfindContributorsView
                        addUnregisteredContributor=addUnregisteredContributor
                        model=model
                        valuePath=valuePath
                        placeholder=placeholder
                        value=value}}`);

    // Changes the value of the input boxes
    this.$('input[name=fullName]').val('Tester Test');
    this.$('input[name=username]').val('test@test.com');

    // Checks the before value of the input boxes
    assert.equal(this.$('input[name=fullName]').val(), 'Tester Test', 'value of input has name before button click');
    assert.equal(this.$('input[name=username]').val(), 'test@test.com', 'value of input has email before button click');

    // Clicks the 'cancel' button
    this.$('button')[0].click();

    // Checks the final value of the input boxes
    assert.equal(this.$('input[name=fullName]').val(), '', 'value of input is blank after button click');
    assert.equal(this.$('input[name=username]').val(), '', 'value of input is blank after button click');
});

test('add unregistered contributor', function(assert) {
    // Tests that the unregistered contributor is added on submit

    function addUnregisteredContributor(component) {
        component.$('input[name=fullName]').val('');
        component.$('input[name=username]').val('');
    }
    this.set('resetfindContributorsView', noop);
    this.set('addUnregisteredContributor', noop);
    this.set('model', this);
    this.set('valuePath', 'username');
    this.set('placeholder', 'Email');
    this.set('value', '');
    this.render(hbs`{{unregistered-contributor-form
                        resetfindContributorsView=resetfindContributorsView
                        addUnregisteredContributor=addUnregisteredContributor
                        model=model
                        valuePath=valuePath
                        placeholder=placeholder
                        value=value
                        addUnregistered='assertUnregistered'}}`);

    // Changes the value of the input boxes
    this.$('input[name=fullName]').val('Tester Test');
    this.$('input[name=username]').val('test@test.com');

    // Checks the before value of the input boxes
    assert.equal(this.$('input[name=fullName]').val(), 'Tester Test', 'value of name input box before submit button click');
    assert.equal(this.$('input[name=username]').val(), 'test@test.com', 'value of email input box before submit button click');

    this.on('assertUnregistered', addUnregisteredContributor(this));

    // Clicks the submit button
    this.$('button')[1].click();

    // Chekcs the after value of the input boxes
    assert.equal(this.$('input[name=fullName]').val(), '', 'value of name input box after submit button is clicked');
    assert.equal(this.$('input[name=username]').val(), '', 'value of email input box after submit button is clicked');
});
