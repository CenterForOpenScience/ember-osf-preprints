export default function() {

    this.post('/preprints');

    this.get('/preprints/:id', (schema, request) => {
        let id = request.params.id;
        return schema.preprints.find(id);
    });

    this.get('/preprints', (schema, request) => {
        return schema.preprints.where(request.queryParams);
    });

    this.get('/subjects', (schema, request) => {
        return schema.subjects.where(request.queryParams);
    });

    this.get('/taxonomies', (schema, request) => {
        return schema.taxonomies.all();
    });
}
