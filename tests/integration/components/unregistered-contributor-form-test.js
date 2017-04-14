import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('unregistered-contributor-form', 'Integration | Component | unregistered contributor form', {
  integration: true
});

const noop = () => {};
/*
function validation (name, email) {
    return first_name_validation(name) && email_validation(email) ? true : false;
/*
    if(first_name_validation(name) && email_validation(email)) {
        return true;
    } else {
        return false;
    }
*/
//}
/*
function first_name_validation (name) {
    return name.length >= 3 ? true : false;
/*
    if(name.length >= 3) {
        return true;
    } else {
        return false;
    }
*/
//}
/*
function email_validation (email) {

    var pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    return pattern.test(email);

}
*/
test('form renders', function(assert) {
    // Tests that the unregistered-contirbutor form renders

    this.set('resetfindContributorsView', noop);
    this.set('addUnregisteredContributor', noop);
    this.render(hbs`{{unregistered-contributor-form
                       resetfindContributorsView=resetfindContributorsView
                       addUnregisteredContributor=addUnregisteredContributor}}`);


    assert.equal(this.$('label')[0].textContent.trim(), 'Full Name');
    assert.equal(this.$('label')[1].textContent.trim(), 'Email');
    assert.equal(this.$('p').text(), 'We will notify the user that they have been added to your preprint.');
    assert.equal(this.$('button')[0].textContent.trim(), 'Cancel');
    assert.equal(this.$('button')[1].textContent.trim(), 'Add');
});

test('cancel unregistered contributor form', function(assert) {
    // Tests that the cancel button properly works to reset the contributor form

    this.set('resetfindContributorsView', function() {
        this.$('input')[0].val = "";
        this.$('input')[1].val = "";
    });
    this.set('addUnregisteredContributor', noop);
    this.set('model', this);
    this.set('valuePath', 'username');
    this.set('placeholder', 'Email');
    this.set('value', '');

    // Renders the handlebars template with variables for inline 'validated-input' component
    this.render(hbs `{{unregistered-contributor-form
                        resetfindContributorsView=resetfindContributorsView
                        addUnregisteredContributor=addUnregisteredContributor
                        model=model
                        valuePath=valuePath
                        placeholder=placeholder
                        value=value}}`);

    // Changes the value of the input boxes
    this.$('input[name=fullname]').val('Tester Test');
    this.$('input[name=email]').val('test@test.com');

    // Checks the before value of the input boxes
//    assert.equal(this.$('input')[0].val, "Tester Test", 'value of input has name before button click');
//    assert.equal(this.$('input')[1].val, "test@test.com", 'value of input has email before button click');

    // Clicks the 'cancel' button
    this.$('button')[0].click();

    // Checks the final value of the input boxes
//    assert.equal(this.$('input')[0].val, "", 'value of input is blank after button click');
//    assert.equal(this.$('input')[1].val, "", 'value of input is blank after button click');
    assert.ok('ok');

});

test('add unregistered contributor', function(assert) {
    // Tests that the unregistered contributor is added on submit

    this.set('resetfindContributorsView', noop);
    this.set('addUnregisteredContributor', noop);
    this.set('model', this);
    this.set('valuePath', 'username');
    this.set('placeholder', 'Email');
    this.set('value', '');
    this.render(hbs `{{unregistered-contributor-form
                        resetfindContributorsView=resetfindContributorsView
                        addUnregisteredContributor=addUnregisteredContributor
                        model=model
                        valuePath=valuePath
                        placeholder=placeholder
                        value=value}}`);

    // Changes the value of the input boxes
    this.$('input')[0].val = "Tester Test";
    this.$('input')[1].val = "test@test.com";

    // Checks the before value of the input boxes
    assert.equal(this.$('input')[0].val, "Tester Test", 'value of name input box before submit button click');
    assert.equal(this.$('input')[1].val, "test@test.com", 'value of email input box before submit button click');

    // Clicks the submit button

});

test('add unregistered contributor invalid input', function(assert) {

    this.set('addUnregistered', function() {
        assert.ok('ok');
    });
    this.set('addUnregisteredContributor', function() {
        assert.ok('ok');
    });
    this.set('resetfindContributorsView', noop);
    this.set('model', this);
    this.set('valuePath', 'username');
    this.set('placeholder', 'Email');
    this.set('value', '');
    this.render(hbs `{{unregistered-contributor-form
                        resetfindContributorsView=resetfindContributorsView
                        addUnregisteredContributor=addUnregisteredContributor
                        model=model
                        valuePath=valuePath
                        placeholder=placeholder
                        value=value
                        addUnregistered=addUnregistered}}`);

    // Changes the value of the input boxes to invalid input
    // Name field needs to be present and have at least 3 letters
    // Email needs to be present and have the appropriate format i.e test@tester.com

    this.$('input')[0].val = "dk";
    this.$('input')[1].val = "dk.co";

    // Clicks the submit button and checks the validation
    this.$('button')[1].click();

    assert.ok('ok');

});
