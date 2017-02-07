import config from 'ember-get-config';

export default function fileDownloadPath(file, node) {
    if (!file || !node) {
        return;
    }
    if (file.get('guid')) {
        return `${config.rootURL}${file.get('guid')}/?action=download`;
    }
    return `${config.rootURL}project/${node.get('id')}/files/osfstorage${file.get('path')}/?action=download`;
}
