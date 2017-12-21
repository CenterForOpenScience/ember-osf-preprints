# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
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

### Fixed
- component integration tests to work in Firefox
  - provider-carousel
  - search-facet-taxonomy

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
