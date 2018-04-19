#!/usr/bin/env node

/* eslint-disable eslint-comments/no-use, prefer-promise-reject-errors, operator-assignment */

/* eslint-env node */
/* eslint no-console: ["error", { allow: ["error", "info", "warn"] }] */

/* eslint-enable eslint-comments/no-use */
const fs = require('fs');
const http = require('http');

const { argv } = process;

if (argv.includes('--help') || argv.includes('-h')) {
    console.info(`Usage: ${__filename.slice(__dirname.length + 1)} [-h|--help] [--dry]`);
    process.exit(0);
}

const isDry = argv.includes('--dry');
const hostsFileName = '/etc/hosts';
const hostIP = '127.0.0.1';
const hostsFile = fs.readFileSync(hostsFileName, { encoding: 'utf8' });
const sectionHeader = '## EMBER-PREPRINTS ##\n';
const sectionFooter = '\n## /EMBER-PREPRINTS ##';
const rgx = new RegExp(`(?:${sectionHeader})(.|\\s)*(?:${sectionFooter})`, 'm');

new Promise((resolve, reject) => {
    http.get('http://localhost:8000/v2/preprint_providers/', (res) => {
        if (res.statusCode !== 200) {
            reject(`Request Failed.\nStatus Code: ${res.statusCode}`);
        }

        res.setEncoding('utf8');
        let rawData = '';

        res.on('data', (chunk) => {
            rawData = rawData + chunk;
        });

        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
            } catch (e) {
                reject(e.message);
            }
        });
    }).on('error', e => reject(e.message));
})
    .then(({ data }) => {
        const domainProviders = data
            .filter(({ id, attributes: { domain } }) => id !== 'osf' && domain)
            .map(({ id, attributes: { domain } }) => ({
                id,
                domain: domain.replace(/^https?:\/\/|(:\d+)?(\/.*)?$/g, ''),
            }));

        const maxLength = domainProviders
            .map(provider => provider.domain.length)
            .reduce((acc, val) => (acc < val ? val : acc), 0);

        const lines = domainProviders
            .map(({ id, domain }) => `${hostIP}\t${domain}${' '.repeat(maxLength - domain.length)}\t# ${id}`)
            .join('\n');

        const section = `${sectionHeader}${lines}${sectionFooter}`;
        const resultFile = rgx.test(hostsFile) ? hostsFile.replace(rgx, section) : `${hostsFile}\n\n${section}`;

        console.info(`Resulting file:\n${resultFile}`);

        if (isDry) {
            console.warn('!!! DRY RUN, File not written !!!');
            process.exit(0);
        }

        fs.writeFileSync(hostsFileName, resultFile, { encoding: 'utf8' });
    })
    .catch(err => console.error(err, '\n\nAre you sure that the API server is running locally on port 8000?'));

/* eslint-enable prefer-promise-reject-errors, operator-assignment */
