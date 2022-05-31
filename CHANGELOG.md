# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.140.0] - 2022-05-31
### Changed
- use ember-osf 0.35

## [0.139.0] - 2022-03-31
### Changed
- use ember-osf 0.34
- use new helpscout support links

## [0.138.0] - 2022-03-15
### Changed
- use ember-osf 0.33
- Updated provider assets
- Added view counts to preprint detail page
- Remove sloan feature flags
- Misc bugs and A11Y fixes

## [0.137.0] - 2021-10-19

### Fixed
-   Accessibility fixes

### Changed
-   Switch to Github Actions for CI

## [0.136.0] - 2021-05-10

### Fixed

-   Show users full name (including middle name) for preprints detail page

## [0.135.0] - 2021-04-26

### Changed

-   email validation regex to remove hard-coded allowed domains and use a more generalized email validation regex

## [0.134.1] - 2021-03-30

### Fixed

-   `withdrawal.pre_moderation_notice_accepted` language typo

## [0.134.0] - 2021-03-30

### Changed

-   Update preprint withdrawal language

## [0.133.3] - 2020-10-08

### Fixed

-   preprints/hypothes.is integration in Chrome

## [0.133.2] - 2020-09-22

### Fixed

-   wrong placeholder text for 'no' prereg links - sloan author assertions

## [0.133.1] - 2020-09-15

### Fixed

-   only show providers that allow submissions on preprint submit page

## [0.133.0] - 2020-09-09

### Fixed

-   broken user gravatar

### Added

-   test selectors to sloan fields

## [0.132.3] - 2020-07-22

### Removed

-   Keen analytics logging

## [0.132.2] - 2020-07-15

### Changed

-   Update assets

## [0.132.1] - 2020-07-14

### Changed

-   Update assets

## [0.132.0] - 2020-06-03

### Added

-   support for `public data links` and `preregistration links` (Sloan Phase II)

## [0.131.3] - 2020-05-06

### Changed

-   Update assets

## [0.131.2] - 2020-05-05

### Changed

-   Update assets

## [0.131.1] - 2020-04-20

### Changed

-   Upgrade ember-osf to `0.30.1`

## [0.131.0] - 2020-04-20

### Added

-   Sloan COI input and display
-   pin node@10.18.1 and yarn@1.21.1 with volta

### Changed

-   Configure nvm to to use Node 10.

## [0.130.4] - 2020-03-27

## Changed

-   update assets

## [0.130.3] - 2020-02-14

## Fixed

-   add `swiss` to list of TLDs in email regex in unregistered-contributor-form component

## [0.130.2] - 2020-01-03

## Fixed

-   removed errant text regarding updated preprint file needing to have the same name

## [0.130.1] - 2020-01-02

### Changed

-   skip probalistic file uploader tests

## [0.130.0] - 2019-12-27

## Changed

-   enable uploading of a preprint with different name and extension
-   remove `whiteListedProviders` from the config since it now comes from the API
-   remove the upload bar on preprints submission unless the file is in the process of being uploaded
-   add beta label to Chronos widget
-   add waffle for Chronos widget
-   use ember-osf@0.27.0

## Fixed

-   do not close panel after preupload

## [0.129.1] - 2019-12-23

### Changed

-   update assets

## [0.129.0] - 2019-11-04

-   add Plaudit widget and use on overview page after meta tags are ready
-   update language and link for product roadmap link

## [0.128.0] - 2019-07-30

## Changed

-   use ember-osf@0.26.0
-   add version as custom dimension 5

## [0.127.0] - 2019-07-25

## Changed

-   use ember-osf@0.25.0
-   modify preprint status banner to show corresponding statuses and reviewer comments
-   synchronize chronos-submission status when user clicks the expand button

## [0.126.1] - 2019-07-02

### Fixed

-   use ember-osf@0.24.3 to get fix for support links

## [0.126.0] - 2019-06-25

-   make preprint withdrawal request explanation required
-   Chronos
    -   only attempt to show the Chronos link when it is present
    -   fix: clicking 'Cancel' after journal selection makes dropdown unusable
    -   fix: filtering on journal title does not work

## [0.125.4] - 2019-06-20

### Changed

-   update assets

## [0.125.3] - 2019-06-06

### Changed

-   update assets

## [0.125.2] - 2019-05-08

### Fixed

-   use ember-osf@0.24.2 to get fix for hypothesis postMessage callback

## [0.125.1] - 2019-05-02

### Fixed

-   use ember-osf@0.24.1 to get fix for hypothesis postMessage and non-US preprints

## [0.125.0] - 2019-04-10

### Added

-   Chronos submission
-   Preprint withdrawals

## [0.124.2] - 2019-04-08

### Fixed

-   make sure there are no line breaks or extra spaces in author list

## [0.124.1] - 2019-03-19

### Changed

-   update assets

## [0.124.0] - 2019-03-04

### Removed

-   Remove margin hack to fix navbar on smaller screens
-   Claim unregistered contributor

### Changed

-   Moved some navbar styling to `osf-style`
-   Added service:current-user to submit controller and preprint-status-banner unit test needs
-   Upgraded to ember-osf@0.23.0
-   Upgraded to osf-style@1.9.0

### Fixed

-   401 error on landing page
-   API unavailable message not displaying when API is unavailable
-   Preprints rendering from correct region
-   Correct "Created on" date for moderated Preprints

## [0.123.4] - 2019-01-31

### Changed

-   update assets

## [0.123.3] - 2019-01-30

### Changed

-   always use preprint DOI for `citation_doi` meta tag

## [0.123.2] - 2019-01-14

### Changed

-   update assets

## [0.123.1] - 2018-12-13

### Changed

-   update to ember-osf@0.22.1

## [0.123.0] - 2018-12-13

### Added

-   section to attach supplemental projects to preprints on submit page

### Changed

-   overhauls to submit/edit preprint form for node-preprint divorce
-   preprints are no longer dependent on osf projects
-   write contributors can now edit preprints
-   upgrade to osf-style@1.8.0

### Removed

-   upload choices on preprint form reduced
-   removed supplemental files browser/visit project section from preprint detail page

## [0.122.6] - 2018-11-21

### Changed

-   add contributors back to metatags (but only block for prerender)

## [0.122.5] - 2018-11-19

### Changed

-   fix linting

## [0.122.4] - 2018-11-19

### Changed

-   revert 0.122.3 and don't load contribs at all for meta

## [0.122.3] - 2018-11-19

### Changed

-   don't block render waiting for meta tag data

## [0.122.2] - 2018-11-09

### Changed

-   Updated to use latest provider assets

## [0.122.1] - 2018-10-10

### Changed

-   meta tag for Google Scholar indexing

## [0.122.0] - 2018-09-20

### Added

-   add `isWithdrawn` to google anlaytics pageTracking
-   ability to download previous preprint (primary file) versions
-   contributor query using elastic endpoint
-   `My Preprints` link to the branded navbar

### Fixed

-   word break in license text
-   provider name on submit form header

### Removed

-   branded footer line-height
-   manual sorting of taxonomies
-   `My OSF Projects` from the branded navbar

## [0.121.1] - 2018-09-14

### Fixed

-   subject filters breaking page when adding/editing preprints

## [0.121.0] - 2018-08-16

### Added

-   whitelist functionality for discover page
-   use of ember-osf `scheduled-banner` component
-   selected provider description in the provider carousel
-   use of "OSF Preprints" as provider name for OSF preprints instead of "OSF" or "Open Science Framework"
-   parameters for `authenticated`, `isPublic` and `resource` to pageView tracking

### Changed

-   update preprint submission page language
-   sharing from the preprint detail view to use ember-osf sharing icons
-   environment check in `config/environment`

### Fixed

-   preprint service select carousel redraw
-   correctly show parent projects in the "Choose project" dropdown

### Removed

-   logic related to updating the node's license

## [0.120.2] - 2018-08-03

### Fixed

-   discover page loading bug

## [0.120.1] - 2018-07-27

### Fixed

-   IE/Edge preprint error

## [0.120.0] - 2018-07-26

### Added

-   Unified solution for preprint words
-   `cookie-banner` component to main application page

### Changed

-   Styling and format of the branded navbar to match current styling in ember-osf
-   Reduced number of calls to the `preprints_provider` endpoint
-   Update preprints to work with a new unified version of ember-osf (works with both preprints and reviews apps)
-   Update preprints to use ember-cli@2.18

## [0.119.0] - 2018-07-16

### Added

-   Hypothes.is commenting toggle

## [0.118.8] - 2018-07-11

### Changed

-   Updated to use latest provider assets

## [0.118.7] - 2018-06-21

### Added

-   `anonymizeIp: true` in GA config to anonymize sender IP.

## [0.118.6] - 2018-06-19

### Changed

-   Updated to use latest provider assets

## [0.118.5] - 2018-04-27

### Changed

-   Updated to use latest provider assets

## [0.118.4] - 2018-04-05

### Fixed

-   Automatic opening of upload section on branded provider submit page

### Removed

-   Unused image code

## [0.118.3] - 2018-03-12

### Added

-   Event Tracking to `Select a Preprint Provider` on preprint upload

### Changed

-   Restricted width and centered preprint provider logos on index page

## [0.118.2] - 2018-03-08

### Removed

-   Ability to search by social fields (reverted)

## [0.118.1] - 2018-03-06

### Fixed

-   Provider assets on production

## [0.118.0] - 2018-03-06

### Added

-   Default auto-expansion on top level subjects when there are no more than 3
-   Check to use `facebookAppId` if branded providers have an app id
-   Choose preprint provider during unbranded submission
-   `unicode-byte-truncate` as a dependency

### Changed

-   'Powered by Preprints' link stay on current server
-   Searching for contributors also searches their social links (such as their twitter handle)
-   Use newly added `name` field for preprint detail page contributors
-   `preprint-form-project-select` component to use `lazy-options` for lazy loading user nodes
-   To pull more data from the preprint model instead of the node model (`title`, `description`, `tags`, etc.)

### Fixed

-   Skipped tests in `convert-or-copy-project-test` and `supplementary-file-browser` to run properly
-   Unicode truncating for LinkedIn sharing using `unicode-byte-truncate`

## [0.117.5] - 2018-02-22

### Changed

-   Update to latest provider assets

## [0.117.4] - 2018-02-21

### Fixed

-   Increase taxonomies page size from 100 to 150

## [0.117.3] - 2018-02-20

### Changed

-   Warning modal on submit page to only show after changes have been made
-   Improve the appearance of the preprint provider logos on the OSFPreprints landing page

## [0.117.2] - 2018-02-09

### Changed

-   Also fingerprint .ico files
-   Update to latest provider assets

## [0.117.1] - 2018-02-09

### Added

-   Exclusion for livedata provider on index page template

## [0.117.0] - 2018-02-09

### Added

-   Auto-expansion on selected subjects on the Discover page
-   `noscript` message if JavaScript is disabled
-   Favicons are updated to reflect their provider, on a branded domain or on a /preprints/provider page
-   DOI message, used on the preprint detail page to show users when they will have a DOI for their preprint.
-   Show a message on detail page when a DOI is created but not yet minted that it takes up to 24 hours to be minted.
-   Original Publication Date is added to preprint.
-   Confirmation message when user tries to reload or navigate away from the preprint submission page after adding/selecting a node
-   `Computed` to check if there has been user changes on the discipline field on the preprint submission/edit form
-   Translations for `Browse by featured subjects`, `Browse by subjects`, and `Browse by providers`
-   Add to `computed` to prevent redirect at any point on preprint submission

### Changed

-   Update to ember-osf 0.14.0
-   Update to use model.queryHasMany in place of model.query
-   Update tests to work with model.queryHasMany
-   Get pagination info directly from meta in preprint-form-authors component
-   Check for `has_highlighted_subjects` flag to determine what wording should be used on index page
-   Use flexbox to show all provider logos in pretty rows

## [0.116.4] - 2018-01-29

### Changed

-   Updated to latest branded provider assets

## [0.116.3] - 2018-01-12

### Added

-   return true to content/index route didTransition so it bubbles to application didTransition (fix for prerender)

## [0.116.2] - 2018-01-11

### Changed

-   Updated to latest branded provider assets

## [0.116.1] - 2018-01-11

### Changed

-   Update CHANGELOG to reflect 0.116.0 release

## [0.116.0] - 2018-01-10

### Added

-   Headless Firefox

### Changed

-   Use yarn --frozen-lockfile instead of --pure-lockfile
-   Use COS ember-base image and multi-stage build
    -   Notify DevOps prior to merging into master to update Jenkins
-   Wording on `Edit preprint` button to `Edit and resubmit` on preprint detail page if the preprint is rejected
    and the workflow is pre-moderation.
-   Removed footer styling
-   Updated `meta.total` to `meta.total_pages` in preprint-form-authors component
-   Modified `preprint-status-banner` component for review action rename.
-   Update to ember-osf@0.13.0

### Fixed

-   component integration tests to work in Firefox
    -   provider-carousel
    -   search-facet-taxonomy
-   CSS contrast issue for support email link on some branded provider error pages.
-   `og:image` meta tag for OSF Preprint refer to incorrect asset
    -   Removed `providers` list in `environment.js`

### Removed

-   `validated-input` component is moved to ember-osf repo

## [0.115.9] - 2017-12-19

### Added

-   Settings for prerender

## [0.115.8] - 2017-12-07

### Added

-   Donate button to branded navbar

### Changed

-   Removed conditional to show donate banner on branded preprints

## [0.115.7] - 2017-12-05

### Changed

-   For unbranded preprints, use advisor board from API rather than hard-coded

## [0.115.6] - 2017-12-04

### Changed

-   Update to ember-osf@0.12.4

## [0.115.5] - 2017-11-29

### Changed

-   Update to ember-osf@0.12.3

## [0.115.4] - 2017-11-29

### Changed

-   Update to ember-osf@0.12.2

## [0.115.3] - 2017-11-21

### Changed

-   Update to ember-osf@0.12.1

## [0.115.2] - 2017-11-15

## Changed

-   Update preprint provider assets submodule

## [0.115.1] - 2017-11-07

## Changed

-   ASU LiveData id from `asu` to `livedata` in search-facet-provider and provider-carousel
-   Update preprint provider assets submodule

## [0.115.0] - 2017-10-27

### Added

-   `preprint-status-banner` component, used on the preprint detail page to show contributors the state of their preprint in a reviews workflow
-   "My Reviewing" link in navbar, if the user is a moderator for a preprint provider

### Changed

-   Update submit/edit page to support reviews workflows
    -   Update language depending on the provider's workflow
    -   Create `action` on preprint submission, instead of setting `is_published: true`

## [0.114.5] - 2017-10-26

### Changed

-   Update to ember-osf@0.11.4

## [0.114.4] - 2017-10-25

### Changed

-   Update to ember-osf@0.11.3

## [0.114.3] - 2017-10-20

### Added

-   hotfix script

### Changed

-   Improve update-assets-hotfix script
-   Update assets

## [0.114.2] - 2017-10-17

### Changed

-   Update cdn to use ember.js version 2.8.3

## [0.114.1] - 2017-10-16

### Changed

-   Discover page locked parameters to "type: preprints" or "source: Thesis Commons"

## [0.114.0] - 2017-10-11

### Added

-   Dockerfile-alpine for small production builds
-   Testem flag to Chrome for no sandbox

### Changed

-   Check provider route slugs against the preprint provider API instead of a hard-coded list
-   Use `shareSource` attribute from preprint provider in faceted search
-   Pass `whiteListedProviders` to discover page component
-   Load osf-style via NPM
-   Get the sentryDSN from the ember config
-   Point Bower to new Bower registry (https://registry.bower.io)
-   Update to @centerforopenscience/ember-osf@0.11.0

### Removed

-   arXiv license permission language
-   Branded provider list from config
