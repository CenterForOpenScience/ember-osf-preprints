#!/usr/bin/env node

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.info(`Usage: ${__filename.slice(__dirname.length + 1)} [-h|--help] [--dry]`);
    process.exit(0);
}

const isDry = process.argv.includes('--dry');

const fs = require('fs');
const config = require('../config/environment')(process.env.EMBER_ENV);

const {providers} = config.PREPRINTS;
const hostsFileName = '/etc/hosts';
const hostIP = '127.0.0.1';
const hostsFile = fs.readFileSync(hostsFileName, {encoding: 'utf8'});
const sectionHeader = '## EMBER-PREPRINTS ##\n';
const sectionFooter = '\n## /EMBER-PREPRINTS ##';
const rgx = new RegExp(`(?:${sectionHeader})(.|\\s)*(?:${sectionFooter})`, 'm');
const domainProviders = providers
    .slice(1)
    .filter(provider => provider.domain)
    .map(provider => {
        provider.domain = provider.domain.replace(/:.*$/, '');
        return provider;
    });

const maxLength = domainProviders
    .map(provider => provider.domain.length)
    .reduce((acc, val) => acc < val ? val : acc, 0);

const lines = domainProviders
    .map(provider => `${hostIP}\t${provider.domain}${' '.repeat(maxLength - provider.domain.length)}\t# ${provider.id}`)
    .join('\n');

const section = `${sectionHeader}${lines}${sectionFooter}`;
const resultFile = rgx.test(hostsFile) ? hostsFile.replace(rgx, section) : `${hostsFile}\n\n${section}`;

console.info(`Resulting file:\n${resultFile}`);

if (isDry) {
    console.log('!!! DRY RUN, File not written !!!');
    process.exit(0);
}

fs.writeFileSync(hostsFileName, resultFile, {encoding: 'utf8'});
