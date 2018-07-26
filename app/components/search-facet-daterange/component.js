import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import Component from '@ember/component';

import moment from 'moment';


const DATE_FORMAT = 'Y-MM-DD';


export default Component.extend({
    statePrevious: null,

    pickerCreated: false,

    pickerValue: computed('states.{start.value,end.value}', 'pickerCreated', function() {
        const start = this.get('states.start.value');
        const end = this.get('states.end.value');

        if (start && this.get('pickerCreated')) {
            const formattedStart = moment(start);
            const formattedEnd = moment(end);
            const picker = this.$('.date-range').data('daterangepicker');

            picker.setStartDate(formattedStart);
            picker.setEndDate(formattedEnd);

            if (picker.chosenLabel && picker.chosenLabel !== 'Custom Range') {
                return picker.chosenLabel;
            } else {
                return `${formattedStart.format(DATE_FORMAT)} - ${formattedEnd.format(DATE_FORMAT)}`;
            }
        } else {
            return 'All time';
        }
    }),

    didInsertElement() {
        this._super(...arguments);

        const dateRanges = {
            'Past week': [moment().subtract(1, 'week'), moment()],
            'Past month': [moment().subtract(1, 'month'), moment()],
            'Past year': [moment().subtract(1, 'year'), moment()],
            'Past decade': [moment().subtract(10, 'year'), moment()],
        };

        const picker = this.$('.date-range');
        picker.daterangepicker({
            ranges: dateRanges,
            autoUpdateInput: false,
            locale: { cancelLabel: 'Clear' },
        });

        picker.on('apply.daterangepicker', (ev, picker) => {
            run(() => {
                const start = picker.startDate;
                const end = picker.endDate;
                this.updateFilter(start, end);
            });
        });

        picker.on('cancel.daterangepicker', () => {
            run(() => {
                this.send('clear');
            });
        });

        this.set('pickerCreated', true);
    },

    actions: {
        clear() {
            this.get('updateFacet')('start', '');
            this.get('updateFacet')('end', '');
        },
    },

    updateFilter(start, end) {
        if (!start && !end) {
            this.send('clear');
        } else {
            const formattedStart = moment(start).format(DATE_FORMAT);
            const formattedEnd = moment(end).format(DATE_FORMAT);

            this.get('updateFacet')('start', formattedStart);
            this.get('updateFacet')('end', formattedEnd);
        }
    },
});
