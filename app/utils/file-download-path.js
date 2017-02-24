import config from 'ember-get-config';

export default function fileDownloadPath(file, node, version) {
    if (!(file && node)) {
        return;
    }

    const path = file.get('guid') || `project/${node.get('id')}/files/osfstorage${file.get('path')}`;

    return `${config.OSF.url}${path}/?action=download${version ? `&version=${version}` : ''}`;
}
