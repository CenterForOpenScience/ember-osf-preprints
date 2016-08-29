import Ember from 'ember';

export default Ember.Component.extend({
    subjectTooltips: {
        'Physical sciences': '<p>Astronomical Sciences</p>' +
            '<p>Chemistry</p>' +
            '<p>Materials Science</p>' +
            '<p>Mathematics</p>' +
            '<p>Physics</p>',
        'Engineering and technology': '<p>Civil Engineering</p>' +
            '<p>Digital Imaging</p>' +
            '<p>Fluidics</p>' +
            '<p>Nanotechnology</p>' +
            '<p>Synthetic Biology</p>',
        'Biology and life sciences': '<p>Ecology</p>' +
            '<p>Genetics</p>' +
            '<p>Neuroscience</p>' +
            '<p>Toxicology</p>' +
            '<p>Zoology</p>',
        'Research and analysis methods': '<p>Computational Techniques</p>' +
            '<p>Decision Analysis</p>' +
            '<p>Imaging Techniques</p>' +
            '<p>Research Assessment</p>' +
            '<p>Simulation and Modeling</p>',
        'Medicine and health sciences': '<p>Anatomy</p>' +
            '<p>Epidemiology</p>' +
            '<p>Medical Ethics</p>' +
            '<p>Sports and Exercise Medicine</p>' +
            '<p>Oncology</p>',
        'Social sciences': '<p>Anthropology</p>' +
            '<p>Economics</p>' +
            '<p>Philosophy</p>' +
            '<p>Political Science</p>' +
            '<p>Psychology</p>',
        'Science policy': '<p>Bioethics</p>' +
            '<p>Open Science</p>' +
            '<p>Research Integrity</p>' +
            '<p>Science Education</p>' +
            '<p>Technology Regulations</p>',
        'People and places': '<p>Demography</p>' +
            '<p>Geographical Locations</p>' +
            '<p>Population groups</p>',
        'Computer and information sciences': '<p>Artificial Intelligence</p>' +
            '<p>Cryptography</p>' +
            '<p>Data Visualization</p>' +
            '<p>Library Science</p>' +
            '<p>Software Engineering</p>',
        'Earth sciences': '<p>Atmospheric Science</p>' +
            '<p>Geology</p>' +
            '<p>Hydrology</p>' +
            '<p>Marine and aquatic sciences</p>' +
            '<p>Mineralogy</p>',
        'Ecology and environmental sciences': '<p>Biogeochemistry</p>' +
            '<p>Environmental Geology</p>' +
            '<p>Natural Resources</p>' +
            '<p>Soil Science</p>' +
            '<p>Sustainability Science</p>'
    },
    didRender() {
        Ember.$('.subject-tooltips').tooltip();
    },
    sortedList: Ember.computed('list', 'list.content', function() {
        if (!this.get('list')) {
            return;
        }
        const sortedList = this.get('list').sortBy('text');
        const pairedList = [];
        for (let i = 0; i < sortedList.get('length'); i += 2) {
            let pair = [];
            pair.pushObject(sortedList.objectAt(i));
            if (sortedList.objectAt(i + 1)) {
                pair.pushObject(sortedList.objectAt(i + 1));
            }
            pairedList.pushObject(pair);
        }
        return pairedList;
    })
});
