import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('file-uploader', 'Integration | Component | file-uploader', {
    integration: true,
});

test('it renders', function(assert) {
    this.set('currentState', 'new');
    this.set('changeInitialState', () => {});
    this.render(hbs`{{file-uploader currentState=currentState changeInitialState=changeInitialState}}`);
    assert.ok(this.$('.btn-default').length);
});

test('currentState is new, hasFile is false', function(assert) {
    this.set('currentState', 'new');
    this.set('hasFile', false);
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState changeInitialState=changeInitialState hasFile=hasFile}}`);
    assert.ok(this.$('.dz-default').length);
    assert.ok(!this.$('input').length);
});

test('currentState is `new`, hasFile is true', function(assert) {
    this.set('currentState', 'new');
    this.set('hasFile', true);
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState changeInitialState=changeInitialState hasFile=hasFile}}`);
    assert.ok(this.$('.dz-default').length);
    assert.ok(this.$('input').length);
});

test('currentState is `version`, preprintLocked is false, hasFile is false, osfFile is null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', false);
    this.set('hasFile', false);
    this.set('osfFile', null);
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(this.$('.dz-default').length);
    assert.ok(!this.$('text-muted.m-v-sm.text-smaller').length);
});

test('currentState is `version`, preprintLocked is true, hasFile is false, osfFile is null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', true);
    this.set('hasFile', false);
    this.set('osfFile', null);
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(this.$('.dz-default').length);
    assert.ok(this.$('.text-muted.m-v-sm.text-smaller').length);
});

test('currentState is `version`, preprintLocked is false, hasFile is true, osfFile is null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', false);
    this.set('hasFile', true);
    this.set('osfFile', null);
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(!this.$('input').length);
});

test('currentState is `version`, preprintLocked is false, hasFile is false, osfFile is not null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', false);
    this.set('hasFile', false);
    this.set('osfFile', {});
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(!this.$('input').length);
});

test('currentState is `version`, preprintLocked is false, hasFile is true, osfFile is not null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', false);
    this.set('hasFile', true);
    this.set('osfFile', {});
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(!this.$('input').length);
});

test('currentState is `version`, preprintLocked is false, hasFile is true, osfFile is not null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', false);
    this.set('hasFile', true);
    this.set('osfFile', {});
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(!this.$('input').length);
});

test('currentState is `version`, preprintLocked is true, hasFile is true, osfFile is not null', function(assert) {
    this.set('currentState', 'version');
    this.set('preprintLocked', true);
    this.set('hasFile', true);
    this.set('osfFile', {});
    this.set('changeInitialState', () => {});
    this.set('createPreprintAndUploadFile', () => {});
    this.render(hbs`{{file-uploader currentState=currentState preprintLocked=preprintLocked changeInitialState=changeInitialState hasFile=hasFile osfFile=osfFile}}`);
    assert.ok(this.$('input').length);
});
