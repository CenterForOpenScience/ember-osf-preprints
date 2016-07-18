import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    preprintid(i) {
        return `preprint${i}`
    },
    title: '',
    date: '',
    authors: '',
    subject: '',
    abstract: ''
});
