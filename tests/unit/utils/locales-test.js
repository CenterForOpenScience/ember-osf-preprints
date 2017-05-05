import englishBaseline from 'preprint-service/locales/en/translations';
import spanish from 'preprint-service/locales/es/translations';
import { module, test } from 'qunit';

module('Unit | Utility | locales');


//Thanks to @penguinboy for https://gist.github.com/penguinboy/762197
function flattenObject(ob) {
	var toReturn = {};

	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;

		if ((typeof ob[i]) == 'object') {
			var flatObject = flattenObject(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;

				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

// Replace this with your real tests.
test('spanish contains all terms', function(assert) {
    let spanishTerms = flattenObject(spanish);
    for (var term in flattenObject(englishBaseline)) {
        assert.ok(typeof spanishTerms[term] !== 'undefined', `${term} not defined.`);
    }
});
