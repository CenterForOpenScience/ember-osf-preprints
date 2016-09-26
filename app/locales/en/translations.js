export default {
    global: {
        share: `Share`,
        cancel: `Cancel`,
        back: `Back`,
        prev: `Prev`,
        next: `Next`,
        none: `None`,
        abstract: `Abstract`,
        doi: `DOI`,
        tags: `Tags`,
        search: `Search`,
        brand: `OSF Preprints`,
        add_preprint: `Add a preprint`,
        title: `Title`,
        search_preprints: `Search preprints...`,
        added_on: `Added on`,
        add: `Add`,
        restart: `Restart`,
        no_results_found: `No results found.`,
        authors: `Authors`,
        convert_project: `The preprint will be organized in the current project`,
        convert_component: `The preprint will be organized in the current component`,
        copy_inside_project: `The preprint will be organized in a new component`,
    },
    application: {
        // Nothing to translate
    },
    content: {
        header: {
            last_edited: `Last edited`
        },
        share: {
            download: `Download`,
            downloads: `Downloads`
        },
        article_doi: `Article DOI`,
        disciplines: `Disciplines`,
        project_button: {
            paragraph: `The project for this paper is available on the Open Science Framework.`,
            button: `Visit project`
        }
    },
    discover: {
        search: {
            heading: `Preprint Search`,
            paragraph: `powered by`,
            placeholder: `Search preprints...`
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
                of: `of`,
                no_results: `Try broadening your search terms`
            }
        }
    },
    index: {
        header: {
            title: {
                paragraph: `The <span class="f-w-lg">open</span> preprint repository network`
            },
            search: `{{count}} searchable preprints`,
            as_of: `as of`,
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
        heading: `Page not found`,
        paragraph: {
            line1: `The page you were looking for is not found on the OSF Preprint service.`,
            line2: `If this should not have occurred and the issue persists, please report it to`
        },
        go_to: `Go to OSF Preprints`
    },
    submit: {
        heading: `Add Preprint`,
        body: {
            p: `Follow these five easy steps to add your preprint to the OSF preprint repository.`,
            file: `Preprint file`,
            title: `Preprint title`,
            subjects_description: `Select a discipline and subdiscipline, if relevant. Add more by clicking on a new discipline or subdiscipline.`,
            basics: {
                doi: {
                    label: `If published, DOI of associated journal article (optional)`
                },
                keywords: {
                    label: `Keywords`,
                    paragraph: `Add keywords to increase discoverability of your preprint`
                },
                abstract: {
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
                    basics: `Basics`
                }
            },
            save_continue: `Save and continue`
        }
    },
    components: {
        'confirm-restart-submit-preprint': {
            title: `Restart Preprint`,
            body: `Are you sure you want to restart this preprint? Your uploaded file and supplemental information will be deleted.`
        },
        'confirm-share-preprint': {
            title: `Share Preprint`,
            body: `Once this preprint is made public, you should assume that it will always be public. Even if you delete it, search engines or others may access the files before you do so.`
        },
        'convert-or-copy': {
            organize_language_project: `You can organize your preprint by storing the file in this project or in its own new component.  If you select ‘Make a new component’, 
            the preprint file will be stored in a new component inside this project.  If you select ‘Use the current project’, the preprint file will be stored in this project. 
            If you are unsure, select ‘Make a new component’.`,
            organize_language_component: `You can organize your preprint by storing the file in this component or in its own new component.  If you select ‘Make a new component’, 
            the preprint file will be stored in a new component inside this component.  If you select ‘Use the current component’, the preprint file will be stored in this component. 
            If you are unsure, select ‘Make a new component’.`,
            copy: `Make a new component`,
            convert_project: `Use the current project`,
            convert_component: `Use the current component`,
            create_a_new_component: `Create a new component`,
            continue_with_this_project: `Continue with this project`,
            continue_with_this_component: `Continue with this component`,
            header_convert_confirmation_project: `Your project details will be saved as you continue to work on this form.`,
            header_convert_confirmation_component: `Your component details will be saved as you continue to work on this form.`,
            convert_confirmation_details_project: `Changes you make on this page are saved immediately.  Create a new component under this project to avoid overwriting its details.`,
            convert_confirmation_details_component: `Changes you make on this page are saved immediately.  Create a new component under this component to avoid overwriting its details.`
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
            add_email: `Add author by email`,
            authors: {
                title: `Author Information`,
                order_instructions: `Drag and drop authors to change authorship order.`,
                name: `Name`,
                permissions: `Permissions`,
                permission_info: `Permission Information`,
                citation: `Citation`,
                citation_info: `Citation Information`,
                parent_contributors: `Add contributors from parent project`
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
            click_edit: `Click to Edit`,
            name: {
                Upload: 'Upload',
                Discipline: 'Discipline',
                Basics: 'Basics',
                Authors: 'Authors',
                Submit: 'Submit',
                choose_project: 'Choose Project',
                choose_file: 'Choose File',
                organize: 'Organize',
                finalize_upload: 'Finalize Upload'
            }
        },
        'preprint-form-project-select': {
            existing_project_selector: `The list of projects appearing in the selector are projects and components for which you have admin access.  Registrations are not included here.`,
            no_valid_existing_nodes: `You have no valid nodes that can be converted into a preprint.  Go back to upload a new preprint.`,
            upload_preprint: `Upload preprint`,
            select_existing_file: `Select existing file as preprint`,
            edit_preprint_title_project: `Edit preprint title (will also become the name of the project)`,
            edit_preprint_title_component: `Edit preprint title (will also become the name of the component)`,
            initiate_preprint_process: `You have selected and organized your preprint file. Clicking "Save and continue" will immediately make changes to your OSF project.`,
            admin_only: `You must be the admin of this component to share it.  Please ask the admin of this project to make you an admin so you may share this component.`
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
            full_name: `Full Name`,
            email: `Email`,
            paragraph: `We will notify the user that they have been added to your preprint.`

        },
        'validated-input': {
            // Nothing to translate
        },
    }
};
