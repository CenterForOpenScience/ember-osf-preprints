import { sanitize } from 'ember-sanitize/utils/sanitize';
import { module, test } from 'ember-qunit';
import footerSanitizer from 'preprint-service/sanitizers/footer-links';
import descriptionSanitizer from 'preprint-service/sanitizers/description';
import advisoryBoardSanitizer from 'preprint-service/sanitizers/advisory-board';

module('SanitizeHelper', {
});

var html = `<b>Bold</b><strong>Strong</strong><em>emphasis</em>
            <u>underline</u><a>link</a><ul>unorderedLists</ul><p>paragraph</p>
            <span>span</span><br><div>div</div><script>noScript</script>`.replace( /\s/g, "");

test('checks footer-links sanitizer', function(assert) {
  var config = {elements:footerSanitizer.elements, attributes:footerSanitizer.attributes};
  var result = sanitize(html, config);
  var expected = `<b>Bold</b><strong>Strong</strong><em>emphasis</em>
                  <u>underline</u><a>link</a>unorderedLists<p>paragraph</p>
                  <span>span</span><br><div>div</div>noScript`.replace( /\s/g, "");
  assert.equal(result, expected);

});

test('checks description sanitizer', function(assert) {
  var config = {elements:descriptionSanitizer.elements, attributes:descriptionSanitizer.attributes};
  var result = sanitize(html, config);
  var expected = `<b>Bold</b><strong>Strong</strong><em>emphasis</em>
                  <u>underline</u><a>link</a>unorderedLists<p>paragraph</p>
                  <span>span</span><br>divnoScript`.replace( /\s/g, "");
  assert.equal(result, expected);

});

test('checks advisory-board sanitizer', function(assert) {
  var config = {elements:advisoryBoardSanitizer.elements, attributes:advisoryBoardSanitizer.attributes};
  var result = sanitize(html, config);
  var expected = `<b>Bold</b><strong>Strong</strong><em>emphasis</em>
                  <u>underline</u><a>link</a><ul>unorderedLists</ul><p>paragraph</p>
                  span<br><div>div</div>noScript`.replace( /\s/g, "");
  assert.equal(result, expected);

});
