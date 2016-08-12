
export default function() {
    this.transition(
        this.hasClass('translate'),
        this.toValue(value => value === 'start'),
        this.use('toRight'),
        this.reverse('toLeft')
    );
    this.transition(
        this.toRoute(['browse', 'add-preprint', 'preprints']),
        this.use('fade', {duration: 500}),
        this.reverse('fade')
    );
}
