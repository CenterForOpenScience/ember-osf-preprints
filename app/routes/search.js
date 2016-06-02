import Ember from 'ember';

var preprints= [{
  id: 1,
  title: 'Paper 1',
  authors: 'Veruca Salt',
  city: 'San Francisco',
  type: 'Estate',
  bedrooms: 15,
  image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg'
}, {
  id: 2,
  title: 'Paper 2',
  authors: 'Veruca Salt',
  city: 'San Francisco',
  type: 'Estate',
  bedrooms: 15,
  image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg'
}, {
  id: 3,
  title: 'Paper 3',
  authors: 'Veruca Salt',
  city: 'San Francisco',
  type: 'Estate',
  bedrooms: 15,
  image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg'
}];

export default Ember.Route.extend({
  model() {
    return preprints;
  }
});


//
// export default Ember.Route.extend({
//   model() {
//     return this.store.findAll('rental');
//   }
// });
