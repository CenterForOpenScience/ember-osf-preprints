import englishBaseline from 'preprint-service/locales/en/translations';
import spanish from 'preprint-service/locales/es-disabled/translations';
import { module, skip } from 'qunit';

module('Unit | Utility | locales');


// Thanks to @penguinboy for https://gist.github.com/penguinboy/762197
function flattenObject(ob) {
    const toReturn = {};
    ob.array.forEach((i) => {
        if (!Object.prototype.hasOwnProperty.call(ob, i)) return;

        if ((typeof ob[i]) === 'object') {
            const flatObject = flattenObject(ob[i]);
            flatObject.array.forEach((x) => {
                if (!Object.prototype.hasOwnProperty.call(flatObject, x)) return;

                toReturn[`${i}.${x}`] = flatObject[x];
            });
        } else {
            toReturn[i] = ob[i];
        }
    });
    return toReturn;
}

// Skip checking Spanish translations while they are disabled.
skip('spanish contains all terms', function(assert) {
    const spanishTerms = flattenObject(spanish);
    flattenObject(englishBaseline).array.forEach((term) => {
        assert.ok(typeof spanishTerms[term] !== 'undefined', `${term} not defined.`);
    });
});
