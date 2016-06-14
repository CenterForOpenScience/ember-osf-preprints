import Ember from 'ember';

export default function() {

  this.post('/preprints');

  this.get('/preprints', (schema, request) => {
      return schema.preprints.all();
  });

  this.get('/subjects', function(schema, request) {
    return schema.subjects.where(request.queryParams);
  });
}
