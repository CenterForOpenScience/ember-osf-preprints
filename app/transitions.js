
export default function() {
    this.transition(
        this.hasClass('translate'),
        this.toValue(value => value === 'start'),
        this.use('toRight'),
        this.reverse('toLeft'),
    );

    this.transition(
        this.hasClass('supplemental'),
        this.toValue(value => value === 'edit'),
        this.use('toRight'),
        this.reverse('toLeft'),
    );

    this.transition(
        this.hasClass('supplemental'),
        this.toValue(value => value === 'start'),
        this.use('toRight'),
        this.reverse('toLeft'),
    );
}
