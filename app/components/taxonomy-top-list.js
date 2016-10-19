import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    // jscs:disable disallowQuotedKeysInObjects
    subjectTooltips: {
        'Physical Sciences': 'Astronomical Sciences, Chemistry, Materials Science, Mathematics, Physics',
        'Engineering and Technology': 'Civil Engineering, Digital Imaging, Fluidics, Nanotechnology, Synthetic Biology',
        'Biology and Life Sciences': 'Ecology, Genetics, Neuroscience, Toxicology, Zoology',
        'Research and Analysis Methods': 'Computational Techniques, Decision Analysis, Imaging Techniques, Research Assessment, Simulation and Modeling',
        'Medicine and Health Sciences': 'Anatomy, Epidemiology, Medical Ethics, Oncology, Sports and Exercise Medicine',
        'Social and Behavioral Sciences': 'Anthropology, Economics, Philosophy, Political Science, Psychology',
        'Science Policy': 'Bioethics, Open Science, Research Integrity, Science Education, Technology Regulations',
        'People and Places': 'Demography, Geographical Locations, Population Groups',
        'Computer and Information Sciences': 'Artificial Intelligence, Cryptography, Data Visualization, Library Science, Software Engineering',
        'Earth Sciences': 'Atmospheric Science, Geology, Hydrology, Marine and Aquatic Sciences, Mineralogy',
        'Ecology and Environmental Sciences': 'Biogeochemistry, Environmental Geology, Natural Resources, Soil Science, Sustainability Science',
        'Business': 'Accounting, Finance and Financial Management, Human Resource Management, Marketing, Taxation',
        'Law': 'Civil Law, Criminal Law, Legislation, State and Local Government Law, Supreme Court of the United States',
        'Education': 'Curriculum Instruction, Educational Administration and Supervision, Educational Leadership, Higher Education, Liberal Studies',
        'Arts and Humanities': 'Fine Arts, History, Music, Philosophy, Religion',
        'Architecture': 'Architectural Engineering, Construction Engineering, Environmental Design, Interior Architecture, Landscape Architecture'
    },
    // jscs:enable
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
