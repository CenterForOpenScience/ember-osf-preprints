import Ember from 'ember';
import Component from '@ember/component';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from 'ember-osf/mixins/analytics';
import fileDownloadPath from '../utils/file-download-path';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays primary file and allows downloading of versions
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-file-renderer
 *      preprint=model
 *      provider=model.provider
 *      primaryFile=primaryFile
 * }}
 * ```
 * @class preprint-file-renderer
 */

const { A } = Ember;
const { PromiseArray } = DS;

export default Component.extend(Analytics, {
    theme: service(),
    store: service(),

    elementId: 'preprint-file-view',
    allowCommenting: false,

    primaryFileHasVersions: computed('versions', function() {
        const versions = this.get('versions');
        if (!versions) return;

        return versions.length > 1;
    }),

    versions: computed('primaryFile', function() {
        const primaryFile = this.get('store').peekRecord('file', this.get('primaryFile.id'));
        const versions = A();

        return PromiseArray.create({
            promise: loadAll(primaryFile, 'versions', versions, { sort: '-id', 'page[size]': 50 })
                .then(this.__serializeVersions.bind(this, versions)),
        });
    }),

    fileDownloadURL: computed('primaryFile', 'selectedVersion', function() {
        return fileDownloadPath(this.get('primaryFile'), this.get('preprint'));
    }),

    didReceiveAttrs() {
        this.get('theme.provider').then(provider => this.setAllowCommenting(provider));
    },

    setAllowCommenting(provider) {
        const publishedAndPublic = this.get('preprint.isPublished') && this.get('preprint.public');
        this.set('allowCommenting', provider.get('allowCommenting') && publishedAndPublic);
    },
    __serializeVersions(versions) {
        const downloadUrl = this.get('primaryFile.links.download');
        const primaryFileGuid = this.get('primaryFile.guid');

        const directDownloadUrl = downloadUrl.replace(
            `download/${primaryFileGuid}`,
            `${primaryFileGuid}/download`,
        );
        const filename = this.get('primaryFile.name');
        this.set('primaryFileHasVersions', versions.length > 1);


        return versions
            .map((version) => {
                const dateFormatted = encodeURIComponent(version.get('dateCreated').toISOString());
                const displayName = filename.replace(/(\.\w+)?$/, ext => `-${dateFormatted}${ext}`);
                version.set('downloadUrl', `${directDownloadUrl}?version=${version.id}&displayName=${displayName}`);
                return version;
            });
    },

});
