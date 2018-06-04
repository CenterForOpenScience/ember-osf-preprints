import RavenLogger from 'ember-cli-sentry/services/raven';

export default RavenLogger.extend({

    ignoreError(error) {
        // Add any errors that we should not send to sentry
        // TODO: Add 'Unhandled Promise error detected'

        return error.name === 'TransitionAborted';
    },
});
