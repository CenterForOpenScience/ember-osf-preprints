import config from 'ember-get-config';

export default function fileDownloadPath(file, node, version) {
    if (!(file && node)) {
        return;
    }
    const guid = file.get('guid');
    const path = guid ? `${guid}/download/?` : `project/${node.get('id')}/files/osfstorage${file.get('path')}/?action=download&`;

    return `${config.OSF.url}${path}${version ? `version=${version}` : ''}`.replace(/[&?]$/, '');
}
