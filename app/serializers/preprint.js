import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
    modelName: 'preprint',

    serialize(snapshot, options) {
        let data = this._super(snapshot, options);
        data.data.attributes = data.data.attributes.attributes || data.data.attributes;
        return data;
    }
});
