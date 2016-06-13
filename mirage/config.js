import Ember from 'ember';

export default function() {
  this.get('/preprints', function() {
    return {
      data: [{
        type: 'preprint',
        id: 1,
        attributes: {
          preprintID: '1',
          title: 'Eating toxic algae makes plankton speedy swimmers',
          date: "Mar 2015",
          authors: 'Veruca Salt',
          subject: 'Biology and life science',
          abstract: 'A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          'Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.',
        }
      }, {
        type: 'preprint',
        id: 2,
        attributes: {
          preprintID: '2',
          title: 'Eating toxic algae makes plankton speedy swimmers',
          date: "Jan 2016",
          authors: 'Veruca Salt',
          subject: 'Earth sciences',
          abstract: 'A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          'Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.',
        }
      }, {
        type: 'preprint',
        id: 3,
        attributes: {
          preprintID: '3',
          title: 'Eating toxic algae makes plankton speedy swimmers',
          authors: 'Veruca Salt',
          subject: 'Biology and life science',
          date: "Sept 2012",
          abstract: 'A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          'Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.',
        }
      },
      {
        type: 'preprint',
        id: 4,
        attributes: {
          preprintID: '4',
          title: 'Eating toxic algae makes plankton speedy swimmers',
          authors: 'Veruca Salt',
          date: "Oct 2013",
          subject: 'Computer and information sciences',
          abstract: 'A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          'Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.',
        }
      },
      {
        type: 'preprint',
        id: 5,
        attributes: {
          preprintID: '5',
          title: 'Eating toxic algae makes plankton speedy swimmers',
          authors: 'Veruca Salt',
          date: 'Nov 1994',
          subject: 'Computer and information sciences',
          abstract: 'A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          'Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.' +
          ' A meal of toxic algae puts a spring into a tiny ocean-dwelling plankton’s trek. The bad news: That just might send it straight into the jaws of a hungry fish. ' +
          ' Copepods (KO-puh-podz) are relatives of shrimp and lobsters. But very tiny cousins. They grow to be only about 1.5 millimeters (less than 0.06 inch) long. Still, size isn’t everything. Each one can suck in 100 liters (26.4 gallons) of seawater per day.',
        }
      }]
    };
  });

  this.get('/preprints/:id', (schema, request) => {
      var id = request.params.id;
      return schema.preprints.find(id);
  });

  this.get('/subjects', function() {
    return {
      data: [
      {
        type: 'subjects',
        id: 1,
        attributes: {
          subject: 'Biology and life science',
          subjectid: 'biology-and-life-science'
        }
      },
      {
        type: 'subjects',
        id: 2,
        attributes: {
          subject: 'Computer and information sciences',
          subjectid: 'computer-and-information-sciences'
        }
      },
        {
        type: 'subjects',
        id: 3,
        attributes: {
          subject: 'Earth sciences',
          subjectid: 'earth-sciences'
        }
      },
       {
        type: 'subjects',
        id: 4,
        attributes: {
          subject: 'Ecology and environmental sciences',
          subjectid: 'ecology-and-environmental-sciences'
        }
      },
       {
        type: 'subjects',
        id: 5,
        attributes: {
          subject: 'Engineering and technology',
          subjectid: 'engineering-and-technology'
        }
      },
       {
        type: 'subjects',
        id: 6,
        attributes: {
          subject: 'Medicine and health sciences',
          subjectid: 'medicine-and-health-sciences'
        }
      },
       {
        type: 'subjects',
        id: 7,
        attributes: {
          subject: 'People and places',
          subjectid: 'people-and-places'
        }
      },
       {
        type: 'subjects',
        id: 8,
        attributes: {
          subject: 'Physical sciences',
          subjectid: 'physical-sciences'
        }
      },
       {
        type: 'subjects',
        id: 9,
        attributes: {
          subject: 'Research and analysis methods',
          subjectid: 'research-and-analysis-methods'
        }
      },
       {
        type: 'subjects',
        id: 10,
        attributes: {
          subject: 'Science policy',
          subjectid: 'science-policy'
        }
      },
       {
        type: 'subjects',
        id: 11,
        attributes: {
          subject: 'Social sciences',
          subjectid: 'social-sciences'
        }
      }
      ]
    };
  });
}
