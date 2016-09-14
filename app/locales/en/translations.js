export default {
    global: {
        share: 'Share',
        cancel: 'Cancel',
        next: 'Next',
        none: 'None',
        abstract: 'Abstract',
        doi: 'DOI',
        tags: 'Tags',
        search: 'Search',
        brand: 'OSF Preprints',
        add_preprint: 'Add a preprint',
        title: 'Title',
        search_preprints: 'Search preprints...',
        added_on: 'Added on',
        add: `Add`
    },
    _404: {
        heading: `Page not found`,
        paragraph: {
            line1: `The page you were looking for is not found on the OSF Preprint service.`,
            line2: `If this should not have occurred and the issue persists, please report it to`
        },
        go_to: `Go to OSF Preprints`
    },
    application: {
        // Nothing to translate
    },
    content: {
        header: {
            added_on: `Added on`,
            last_edited: `Last edited`
        },
        share: {
            download: `Download`,
            downloads: `Downloads`
        },
        abstract: `Abstract`,
        article_doi: `Article DOI`,
        disciplines: `Disciplines`,
        tags: `Tags`,
        none: `None`,
        project_button: {
            paragraph: `The project for this paper is available on the Open Science Framework.`,
            button: `Visit project`
        }
    },
    discover: {
        search: {
            heading: `Preprint Search`,
            paragraph: `powered by`,
            placeholder: `Search preprints...`,
            button: `Search`
        },
        sort_by: `Sort by`,
        main: {
            active_filters: {
                heading: `Active Filters`,
                button: `Clear filters`
            },
            refine: `Refine your search by`,
            providers: `Providers`,
            subject: `Subject`,
            box: {
                paragraph: `Do you want to add your own research as a preprint?`,
                button: `Add your preprint`
            },
            results: {
                prev: `Prev`,
                of: `of`,
                next: `Next`,
                no_results: {
                    line1: `No results found`,
                    line2: `Try broadening your search terms`
                }
            }
        }
    },
    index: {
        header: {
            title: {
                heading: `OSF Preprints`,
                paragraph: `The <span class="f-w-lg">open</span> preprint repository network`
            },
            search: `{{count}} searchable preprints`,
            as_of: `as of`,
            add: `Add a preprint`,
            example: `See an example`
        },
        subjects: {
            heading: `Browse <small>by subject</small>`
        },
        services: {
            top: {
                heading: `Preprint Services`,
                paragraph: `Leading preprint service providers use this open source infrastructure to support their communities.`
            },
            bottom: {
                p1: `Create your own branded preprint servers backed by the OSF.`,
                div: {
                    line1: `Check out the <a class="source_code_link" href="{{href}}"> open source code</a>`,
                    line2: `and the <a class="source_code_link" href="{{href}}">requirements and road map</a>.`,
                    line3: `Input welcome!`
                },
                contact: `Contact us`
            }
        },
        advisory: {
            heading: `Advisory Group`,
            paragraph: `Our advisory group includes leaders in preprints and scholarly communication`
        }
    },
    'page-not-found': {
        // See _404
    },
    submit: {
        heading: `Add Preprint`,
        body: {
            p: `Follow these five easy steps to add your preprint to the OSF preprint repository.`,
            file: `Preprint file`,
            title: `Preprint title`,
            title_placeholder: `Title`,
            restart: `Restart`,
            next: `Next`,
            subjects_description: `Select a discipline and subdiscipline, if relevant. Add more by clicking on a new discipline or subdiscipline.`,
            basics: {
                doi: {
                    label: `If published, DOI of associated journal article (optional)`,
                    placeholder: `DOI`
                },
                keywords: {
                    label: `Keywords`,
                    paragraph: `Add keywords to increase discoverability of your preprint`
                },
                abstract: {
                    label: `Abstract`,
                    placeholder: `Add a brief summary of your preprint`
                }
            },
            authors: {
                paragraph: `Add preprint authors and order them appropriately. Search looks for authors that have OSF accounts already. Unregistered users can be added and invited to join the preprint.`
            },
            submit: {
                paragraph: `When you share this preprint, it will become publicly accessible via OSF Preprints. This also creates an OSF project in case you would like to attach other content to your preprint such as supplementary materials, appendices, data, or protocols. If posting this preprint is your first exposure to the OSF, you will receive an email introducing OSF to you.`,
                invalid: {
                    description: `The following section(s) must be completed before sharing this preprint.`,
                    discipline: `Discipline`,
                    basics: `Basics`,
                    authors: `Authors`
                },
                share: `Share`
            },
            save_continue: `Save and continue`
        }
    },
    components: {
        'confirm-restart-submit-preprint': {
            title: `Restart Preprint`,
            body: `Are you sure you want to restart this preprint? Your uploaded file and supplemental information will be deleted.`,
            cancel: `Cancel`,
            restart: `Restart`
        },
        'confirm-share-preprint': {
            title: `Share Preprint`,
            body: `Once this preprint is made public, you should assume that it will always be public. Even if you delete it, search engines or others may access the files before you do so.`,
            cancel: `Cancel`,
            share: `Share`
        },
        'file-uploader': {
            dropzone_message: `Drop preprint file here to upload`,
            title_placeholder: `Enter preprint title`
        },
        'preprint-form-authors': {
            search: {
                placeholder: `Search by name`
            },
            unregistered_users: {
                paragraph: `Can't find the user you're looking for?`,
                button: `Add author by email address`
            },
            results: `Results`,
            yourself: `Yourself`,
            already_added: `Already added`,
            add: `Add`,
            no_results: `No results found.`,
            add_email: `Add author by email`,
            authors: {
                heading: `Authors`,
                title: `Author Information`,
                order_instructions: `Drag and drop authors to change authorship order.`,
                name: `Name`,
                permissions: `Permissions`,
                permission_info: `Permission Information`,
                citation: `Citation`,
                citation_info: `Citation Information`
            },
            remove: `Remove`
        },
        'preprint-form-body': {
            // Nothing to translate
         },
        'preprint-form-header': {
            changes_saved: `Changes Saved!`,
            file: `Preprint file`,
            title: `Preprint title`,
            click_edit: `Click to Edit`
        },
        'preprint-form-section': {
            // Nothing to translate
        },
        'preprint-navbar': {
            toggle: `Toggle navigation`
        },
        'project-chooser': {
            file_upload_create: `Upload a file and create an OSF project`,
            provide_title: `Please provide a title for your project`,
            continue: `Continue`,
            choose_project_component: `Choose an existing project or component`,
            file_upload_existing: `Upload a file to an existing OSF project`,
            choose_project: `Choose project`,
            file_choose_existing: `Choose a file from an existing OSF project`,
            choose_file: `Choose file`
        },
        'search-preprints': {
            // Nothing to translate
        },
        'search-result': {
            // Nothing to translate
        },
        'share-popup': {
            tweet: `Tweet`,
            post_facebook: `Post to Facebook`,
            share_linkedin: `Share on LinkedIn`,
            send_email: `Send in email`
        },
        'supplementary-file-browser': {
            primary: `Primary`
        },
        'taxonomy-top-list': {
            // Nothing to translate
        },
        'taxonomy-tree': {
            // Nothing to translate
        },
        'unregistered-contributor-form': {
            full_name: `Full name`,
            email: `Email`,
            paragraph: `We will notify the user that they have been added to your preprint.`

        },
        'validated-input': {
            // Nothing to translate
        },
    }
};
