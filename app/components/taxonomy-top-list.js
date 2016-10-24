import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    // jscs:disable disallowQuotedKeysInObjects
    subjectTooltips: {
        'Physical sciences': 'Astronomical Sciences, Chemistry, Materials Science, Mathematics, Physics',
        'Engineering and technology': 'Civil Engineering, Digital Imaging, Fluidics, Nanotechnology, Synthetic Biology',
        'Biology and life sciences': 'Ecology, Genetics, Neuroscience, Toxicology, Zoology',
        'Research and analysis methods': 'Computational Techniques, Decision Analysis, Imaging Techniques, Research Assessment, Simulation and Modeling',
        'Medicine and health sciences': 'Anatomy, Epidemiology, Medical Ethics, Oncology, Sports and Exercise Medicine',
        'Social and behavioral sciences': 'Anthropology, Economics, Philosophy, Political Science, Psychology',
        'Science policy': 'Bioethics, Open Science, Research Integrity, Science Education, Technology Regulations',
        'People and places': 'Demography, Geographical Locations, Population Groups',
        'Computer and information sciences': 'Artificial Intelligence, Cryptography, Data Visualization, Library Science, Software Engineering',
        'Earth sciences': 'Atmospheric Science, Geology, Hydrology, Marine and Aquatic Sciences, Mineralogy',
        'Ecology and environmental sciences': 'Biogeochemistry, Environmental Geology, Natural Resources, Soil Science, Sustainability Science',
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
