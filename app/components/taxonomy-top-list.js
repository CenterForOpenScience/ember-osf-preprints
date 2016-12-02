import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    // jscs:disable disallowQuotedKeysInObjects
    subjectTooltips: {
        'Architecture': 'Architectural Engineering, Construction Engineering, Environmental Design, Interior Architecture, Landscape Architecture',
        'Arts and Humanities': 'Fine Arts, History, Music, Philosophy, Religion',
        'Business': 'Accounting, Finance and Financial Management, Human Resource Management, Marketing, Taxation',
        'Education': 'Curriculum and Instruction, Educational Administration and Supervision, Educational Leadership, Higher Education, Liberal Studies',
        'Engineering': 'Aerospace Engineering, Automotive Engineering, Aviation, Biomedical Engineering and Bioengineering, Bioresource and Agricultural Engineering, Chemical Engineering, Civil and Environmental Engineering, Computational Engineering, Computer Engineering, Electrical and Computer Engineering, Engineering Education, Engineering Science and Materials, Materials Science and Engineering, Mechanical Engineering, Mining Engineering, Nanoscience and Nanotechnology, Nuclear Engineering, Operations Research, Systems Engineering and Industrial Engineering, Other Engineering, Risk Analysis',
        'Law': 'Civil Law, Criminal Law, Legislation, State and Local Government Law, Supreme Court of the United States',
        'Life Sciences': 'Agriculture, Genetics and Genomics, Microbiology, Physiology, Zoology',
        'Medicine and Health Sciences': 'Anatomy, Diseases, Medical Sciences, Public Health, Veterinary Medicine',
        'Physical Sciences and Mathematics': 'Chemistry, Computer Sciences, Earth Sciences, Physics, Statistics and Probability',
        'Social and Behavioral Sciences': 'Anthropology, Economics, Political Science, Psychology, Sociology',
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
