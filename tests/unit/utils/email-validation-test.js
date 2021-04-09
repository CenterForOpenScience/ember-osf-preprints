import emailValidationRegex from 'preprint-service/utils/email-validation';
import { module, test } from 'qunit';

module('Unit | Utility | email validation');

test('check against allowed email domains', function(assert) {
    const allowedDomains = [
        'endo@domain.org',
        'tsukahara@email.domain.edu',
        'kasa!matsu@[123.321.456.789]',
        'yama#waki@0ph1.1pb2.hb',
        'kenzo_shirai@phs.scot',
        'shun.fujimoto@mfn.berlin',
        'takashi-ono@alumni.ubc.ca',
        'ouagadougou@berkina.faso',
        '=@03.zz',
    ];
    allowedDomains.forEach((domain) => {
        assert.ok(emailValidationRegex.test(domain));
    });
});

test('check against disallowed email domains', function(assert) {
    const disallowedDomains = [
        'morisue@domain@org',
        'koji@gushiken..gov',
        'sawao.kato@[1234.321.456.789]',
        'nakayama@abc.123',
        'eizo kenmotsu@place.abc',
        'hiro\\yuki@tomita.zz',
        'kohei.@uchi.mura',
    ];
    disallowedDomains.forEach((domain) => {
        assert.notOk(emailValidationRegex.test(domain));
    });
});
