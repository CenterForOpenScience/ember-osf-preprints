<<<<<<< HEAD
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';

=======
>>>>>>> 2c12d5a14817362b5bacca1c56162445060e70ca
import Application from '../../app';
import config from '../../config/environment';
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';

export default function startApp(attrs) {
<<<<<<< HEAD
    let attributes = merge({}, config.APP);
    attributes.autoboot = true;
    attributes = merge(attributes, attrs); // use defaults, but you can override;

    return run(() => {
        const application = Application.create(attributes);
        application.setupForTesting();
        application.injectTestHelpers();
        return application;
    });
=======
  let attributes = merge({}, config.APP);
  attributes.autoboot = true;
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    const application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
>>>>>>> 2c12d5a14817362b5bacca1c56162445060e70ca
}
