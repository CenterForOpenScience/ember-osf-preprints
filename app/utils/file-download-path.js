import config from 'ember-get-config';

export default function fileDownloadPath(file, node) {
    if (!file || !node) {
        return;
    }
    if (file.get('guid')) {
        return `${config.OSF.url}${file.get('guid')}/?action=download`;
    }
    return `${config.OSF.url}project/${node.get('id')}/files/osfstorage${file.get('path')}/?action=download`;
}
