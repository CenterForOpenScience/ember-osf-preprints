import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * Displays top level disciplines for preprints index page
 *
 * Sample usage:
 * ```handlebars
 * {{taxonomy-top-list
 *     list=model.taxonomies
 * }}
 * ```
 * @class taxonomy-top-list
 * @namespace component
 */
export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    // jscs:disable disallowQuotedKeysInObjects
    subjectTooltips: {
        'Architecture': 'Architectural Engineering, Construction Engineering, Environmental Design, Interior Architecture, Landscape Architecture',
        'Arts and Humanities': 'Fine Arts, History, Music, Philosophy, Religion',
        'Business': 'Accounting, Finance and Financial Management, Human Resource Management, Marketing, Taxation',
        'Education': 'Curriculum and Instruction, Educational Administration and Supervision, Educational Leadership, Higher Education, Liberal Studies',
        'Engineering': 'Biomedical Engineering and Bioengineering, Chemical Engineering, Civil and Environmental Engineering, Electrical and Computer Engineering, Mechanical Engineering',
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
