# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.122.4] - 2018-11-19
### Changed
- revert 0.122.3 and don't load contribs at all for meta

## [0.122.3] - 2018-11-19
### Changed
- don't block render waiting for meta tag data

## [0.122.2] - 2018-11-09
### Changed
- Updated to use latest provider assets

## [0.122.1] - 2018-10-10
### Changed
- meta tag for Google Scholar indexing

## [0.122.0] - 2018-09-20
### Added
- add `isWithdrawn` to google anlaytics pageTracking
- ability to download previous preprint (primary file) versions
- contributor query using elastic endpoint
- `My Preprints` link to the branded navbar

### Fixed
- word break in license text
- provider name on submit form header

### Removed
- branded footer line-height
- manual sorting of taxonomies
- `My OSF Projects` from the branded navbar

## [0.121.1] - 2018-09-14
### Fixed
- subject filters breaking page when adding/editing preprints

## [0.121.0] - 2018-08-16
### Added
- whitelist functionality for discover page
- use of ember-osf `scheduled-banner` component
- selected provider description in the provider carousel
- use of "OSF Preprints" as provider name for OSF preprints instead of "OSF" or "Open Science Framework"
- parameters for `authenticated`, `isPublic` and `resource` to pageView tracking

### Changed
- update preprint submission page language
- sharing from the preprint detail view to use ember-osf sharing icons
- environment check in `config/environment`

### Fixed
- preprint service select carousel redraw
- correctly show parent projects in the "Choose project" dropdown

### Removed
- logic related to updating the node's license

## [0.120.2] - 2018-08-03
### Fixed
- discover page loading bug

## [0.120.1] - 2018-07-27
### Fixed
- IE/Edge preprint error

## [0.120.0] - 2018-07-26
### Added
- Unified solution for preprint words
- `cookie-banner` component to main application page

### Changed
- Styling and format of the branded navbar to match current styling in ember-osf
- Reduced number of calls to the `preprints_provider` endpoint
- Update preprints to work with a new unified version of ember-osf (works with both preprints and reviews apps)
- Update preprints to use ember-cli@2.18

## [0.119.0] - 2018-07-16
### Added
- Hypothes.is commenting toggle

## [0.118.8] - 2018-07-11
### Changed
- Updated to use latest provider assets

## [0.118.7] - 2018-06-21
### Added
- `anonymizeIp: true` in GA config to anonymize sender IP.

## [0.118.6] - 2018-06-19
### Changed
- Updated to use latest provider assets

## [0.118.5] - 2018-04-27
### Changed
- Updated to use latest provider assets

## [0.118.4] - 2018-04-05
### Fixed
- Automatic opening of upload section on branded provider submit page

### Removed
- Unused image code

## [0.118.3] - 2018-03-12
### Added
- Event Tracking to `Select a Preprint Provider` on preprint upload

### Changed
- Restricted width and centered preprint provider logos on index page

## [0.118.2] - 2018-03-08
### Removed
- Ability to search by social fields (reverted)

## [0.118.1] - 2018-03-06
### Fixed
- Provider assets on production

## [0.118.0] - 2018-03-06
### Added
- Default auto-expansion on top level subjects when there are no more than 3
- Check to use `facebookAppId` if branded providers have an app id
- Choose preprint provider during unbranded submission
- `unicode-byte-truncate` as a dependency

### Changed
- 'Powered by Preprints' link stay on current server
- Searching for contributors also searches their social links (such as their twitter handle)
- Use newly added `name` field for preprint detail page contributors
- `preprint-form-project-select` component to use `lazy-options` for lazy loading user nodes
- To pull more data from the preprint model instead of the node model (`title`, `description`, `tags`, etc.)

### Fixed
- Skipped tests in `convert-or-copy-project-test` and `supplementary-file-browser` to run properly
- Unicode truncating for LinkedIn sharing using `unicode-byte-truncate`

## [0.117.5] - 2018-02-22
### Changed
- Update to latest provider assets

## [0.117.4] - 2018-02-21
### Fixed
- Increase taxonomies page size from 100 to 150

## [0.117.3] - 2018-02-20
### Changed
- Warning modal on submit page to only show after changes have been made
- Improve the appearance of the preprint provider logos on the OSFPreprints landing page

## [0.117.2] - 2018-02-09
### Changed
- Also fingerprint .ico files
- Update to latest provider assets

## [0.117.1] - 2018-02-09
### Added
- Exclusion for livedata provider on index page template

## [0.117.0] - 2018-02-09
### Added
- Auto-expansion on selected subjects on the Discover page
- `noscript` message if JavaScript is disabled
- Favicons are updated to reflect their provider, on a branded domain or on a /preprints/provider page
- DOI message, used on the preprint detail page to show users when they will have a DOI for their preprint.
- Show a message on detail page when a DOI is created but not yet minted that it takes up to 24 hours to be minted.
- Original Publication Date is added to preprint.
- Confirmation message when user tries to reload or navigate away from the preprint submission page after adding/selecting a node
- `Computed` to check if there has been user changes on the discipline field on the preprint submission/edit form
- Translations for `Browse by featured subjects`, `Browse by subjects`, and `Browse by providers`
- Add to `computed` to prevent redirect at any point on preprint submission

### Changed
- Update to ember-osf 0.14.0
- Update to use model.queryHasMany in place of model.query
- Update tests to work with model.queryHasMany
- Get pagination info directly from meta in preprint-form-authors component
- Check for `has_highlighted_subjects` flag to determine what wording should be used on index page
- Use flexbox to show all provider logos in pretty rows

## [0.116.4] - 2018-01-29
### Changed
- Updated to latest branded provider assets

## [0.116.3] - 2018-01-12
### Added
- return true to content/index route didTransition so it bubbles to application didTransition (fix for prerender)

## [0.116.2] - 2018-01-11
### Changed
- Updated to latest branded provider assets

## [0.116.1] - 2018-01-11
### Changed
- Update CHANGELOG to reflect 0.116.0 release

## [0.116.0] - 2018-01-10
### Added
- Headless Firefox

### Changed
- Use yarn --frozen-lockfile instead of --pure-lockfile
- Use COS ember-base image and multi-stage build
  - Notify DevOps prior to merging into master to update Jenkins
- Wording on `Edit preprint` button to `Edit and resubmit` on preprint detail page if the preprint is rejected
 and the workflow is pre-moderation.
- Removed footer styling
- Updated `meta.total` to `meta.total_pages` in preprint-form-authors component
- Modified `preprint-status-banner` component for review action rename.
- Update to ember-osf@0.13.0

### Fixed
- component integration tests to work in Firefox
  - provider-carousel
  - search-facet-taxonomy
- CSS contrast issue for support email link on some branded provider error pages.
- `og:image` meta tag for OSF Preprint refer to incorrect asset
  - Removed `providers` list in `environment.js`

### Removed
- `validated-input` component is moved to ember-osf repo

## [0.115.9] - 2017-12-19
### Added
- Settings for prerender

## [0.115.8] - 2017-12-07
### Added
- Donate button to branded navbar

### Changed
- Removed conditional to show donate banner on branded preprints

## [0.115.7] - 2017-12-05
### Changed
- For unbranded preprints, use advisor board from API rather than hard-coded

## [0.115.6] - 2017-12-04
### Changed
- Update to ember-osf@0.12.4

## [0.115.5] - 2017-11-29
### Changed
- Update to ember-osf@0.12.3

## [0.115.4] - 2017-11-29
### Changed
- Update to ember-osf@0.12.2

## [0.115.3] - 2017-11-21
### Changed
- Update to ember-osf@0.12.1

## [0.115.2] - 2017-11-15
## Changed
- Update preprint provider assets submodule

## [0.115.1] - 2017-11-07
## Changed
- ASU LiveData id from `asu` to `livedata` in search-facet-provider and provider-carousel
- Update preprint provider assets submodule

## [0.115.0] - 2017-10-27
### Added
- `preprint-status-banner` component, used on the preprint detail page to show contributors the state of their preprint in a reviews workflow
- "My Reviewing" link in navbar, if the user is a moderator for a preprint provider

### Changed
- Update submit/edit page to support reviews workflows
  - Update language depending on the provider's workflow
  - Create `action` on preprint submission, instead of setting `is_published: true`

## [0.114.5] - 2017-10-26
### Changed
- Update to ember-osf@0.11.4

## [0.114.4] - 2017-10-25
### Changed
- Update to ember-osf@0.11.3

## [0.114.3] - 2017-10-20
### Added
- hotfix script

### Changed
- Improve update-assets-hotfix script
- Update assets

## [0.114.2] - 2017-10-17
### Changed
- Update cdn to use ember.js version 2.8.3

## [0.114.1] - 2017-10-16
### Changed
- Discover page locked parameters to "type: preprints" or "source: Thesis Commons"

## [0.114.0] - 2017-10-11
### Added
- Dockerfile-alpine for small production builds
- Testem flag to Chrome for no sandbox

### Changed
- Check provider route slugs against the preprint provider API instead of a hard-coded list
- Use `shareSource` attribute from preprint provider in faceted search
- Pass `whiteListedProviders` to discover page component
- Load osf-style via NPM
- Get the sentryDSN from the ember config
- Point Bower to new Bower registry (https://registry.bower.io)
- Update to @centerforopenscience/ember-osf@0.11.0

### Removed
- arXiv license permission language
- Branded provider list from config
