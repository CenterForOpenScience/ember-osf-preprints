export function initialize(appInstance) {
    let store = appInstance.lookup('service:store');
    let provider = appInstance.lookup('service:provider');
    let provider_url = window.location.host;
    // //FOR TESTING
    // if (provider_url === '127.0.0.1:5000') {
    //     provider_url = 'http://engrxiv.org';
    // }
    // ///
    if (store) {
        store.query('preprint-provider', {filter: {external_url: provider_url}}).then(function(results) {
            if (results.get('length') === 1) {
                results.map(each => provider.set('provider', each));
                console.log('AYYYY LMAO');
            }
        });
    }
}

export default {
  name: 'provider-loader',
  initialize
};
