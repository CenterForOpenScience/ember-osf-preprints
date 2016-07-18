import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
    modelName: 'document',
    serialize(snapshot, options) {
        let data = this._super(snapshot, options);
        data.data.attributes = data.data.attributes.attributes;
        return data;
    }
});
