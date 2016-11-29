#!/usr/bin/env node

if (~process.argv.indexOf('--help') || ~process.argv.indexOf('-h'))
    return console.info(`Usage: ${__filename.slice(__dirname.length + 1)} [-h|--help] [--dry]`);

const isDry = ~process.argv.indexOf('--dry');

const fs = require('fs');
const config = require('../config/environment')(process.env.EMBER_ENV);

const providers = config.PREPRINTS.providers;
const hostsFileName = '/etc/hosts';
const hostIP = '127.0.0.1';
const hostsFile = fs.readFileSync(hostsFileName, {encoding: 'utf8'});
const sectionHeader = '## EMBER-PREPRINTS ##\n';
const sectionFooter = '\n## /EMBER-PREPRINTS ##';
const rgx = new RegExp(`(?:${sectionHeader})(.|\\s)*(?:${sectionFooter})`, 'm');

const maxLength = providers
    .map(provider => provider.domain)
    .reduce((a, b) => a.length > b.length ? a.length : b.length);

const lines = providers
    .map(provider => `${hostIP}\tlocal.${provider.domain}${' '.repeat(maxLength - provider.domain.length)}\t# ${provider.id}`)
    .join('\n');

const section = `${sectionHeader}${lines}${sectionFooter}`;
const resultFile = rgx.test(hostsFile) ? hostsFile.replace(rgx, section) : `${hostsFile}\n\n${section}`;

console.info(`Resulting file:\n${resultFile}`);

if (isDry)
    console.log('!!! DRY RUN, File not written !!!');
else
    fs.writeFileSync(hostsFileName, resultFile, {encoding: 'utf8'});
