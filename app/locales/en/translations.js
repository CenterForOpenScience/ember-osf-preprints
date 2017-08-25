const preprints = `{{preprintWords.Preprints}}`;
const brand = `OSF Preprints`;
const arxiv_trademark_license = 'arXiv is a trademark of Cornell University, used under license.';

export default {
    global: {
        share: `Share`,
        complete: `Complete`,
        cancel: `Cancel`,
        discard: `Discard changes`,
        back: `Back`,
        prev: `Prev`,
        next: `Next`,
        none: `None`,
        abstract: `Abstract`,
        doi: `DOI`,
        tags: `Tags`,
        search: `Search`,
        preprints,
        brand,
        brand_name: 'OSF',
        provider_brand: `{{name}} {{preprintWords.Preprints}}`,
        add_preprint: `Add a {{preprintWords.preprint}}`,
        title: `Title`,
        search_preprints: `Search {{preprintWords.preprints}}...`,
        added_on: `Added on`,
        add: `Add`,
        restart: `Restart`,
        no_results_found: `No results found.`,
        authors: `Authors`,
        convert_project: `The {{preprintWords.preprint}} will be organized in the current project`,
        convert_component: `The {{preprintWords.preprint}} will be organized in the current component`,
        copy_inside_project: `The {{preprintWords.preprint}} will be organized in a new component`,
        open_science_framework: `Open Science Framework`,
        license: 'License',
        pre_moderation: `pre-moderation`,
        post_moderation: `post-moderation`,
    },
    application: {
        separator: ` | `
    },
    content: {
        header: {
            last_edited: `Last edited`
        },
        date_label: {
            created_on: `Created on`,
            submitted_on: `Submitted on`
        },
        share: {
            download: `Download`,
            downloads: `Downloads`,
            download_file: `Download file`,
            download_preprint: `Download {{preprintWords.preprint}}`
        },
        see_more: 'See more',
        see_less: 'See less',
        version: 'Version',
        preprint_doi: `{{preprintWords.Preprint}} DOI`,
        article_doi: `Peer-reviewed Publication DOI`,
        citations: `Citations`,
        disciplines: `Disciplines`,
        project_button: {
            paragraph: `The project for this paper is available on the OSF.`,
            button: `Visit project`,
            edit_preprint:  `Edit {{preprintWords.preprint}}`
        },
        orphan_preprint: `The user has removed this file.`,
        private_preprint_warning: `This {{preprintWords.Preprint}} is private. Make it discoverable by making`,
        public: `public`
    },
    discover: {
        search: {
            heading: `{{preprintWords.Preprint}} Archive Search`,
            heading_repository_search: `Repository Search`,
            paragraph: `powered by`,
            partner: `Partner Repositories`,
            placeholder: `Search {{preprintWords.preprints}}...`,
            repository_placeholder: `Search repository...`
        },
        sort_by: `Sort by`,
        sort_newest_oldest: `Modified Date (newest to oldest)`,
        sort_oldest_newest: `Modified Date (oldest to newest)`,
        modified_on: `Modified on`,
        relevance: `Relevance`,
        main: {
            active_filters: {
                heading: `Active Filters`,
                button: `Clear filters`
            },
            refine: `Refine your search by`,
            providers: `Providers`,
            subject: `Subject`,
            source: `Source`,
            date: `Date`,
            type: `Type`,
            tag: `Tag`,
            box: {
                paragraph: `Do you want to add your own research as a {{preprintWords.preprint}}?`,
                button: `Add your {{preprintWords.preprint}}`
            },
            results: {
                of: `of`,
                no_results: `Try broadening your search terms`
            },
            otherRepositories: `Other {{preprintWords.preprint}} repositories`,
        }
    },
    index: {
        header: {
            title: {
                paragraph: `The <span class="f-w-lg">open</span> {{preprintWords.preprint}} repository network`
            },
            powered_by: `Powered by ${brand}`,
            or: `or`,
            as_of: `as of`,
            example: `See an example`
        },
        subjects: {
            heading: `Browse <small>by {{browse-by}}</small>`
        },
        services: {
            top: {
                heading: `{{preprintWords.Preprint}} Services`,
                paragraph: `Leading {{preprintWords.preprint}} service providers use this open source infrastructure to support their communities.`
            },
            bottom: {
                p1: `Create your own branded {{preprintWords.preprint}} servers backed by the OSF.`,
                div: {
                    line1: `Check out the`,
                    linkText1: `open source code`,
                    line2: `and the`,
                    linkText2: `requirements and road map`,
                    line3: `. Input welcome!`
                },
                contact: `Contact us`
            }
        },
        advisory: {
            heading: `Advisory Group`,
            paragraph: `Our advisory group includes leaders in preprints and scholarly communication`
        }
    },
    // Error pages
    'page-not-found': { // 404
        heading: `Page not found`,
        message: `The page you were looking for is not found on the {{brand}} service.`
    },
    'page-forbidden': { // 403
        heading: `Forbidden`,
        message: `User has restricted access to this page.`
    },
    'resource-deleted': { // 410
        heading: `Resource deleted`,
        message: `User has deleted this content.`
    },
    submit: {
        create_heading: `Create {{preprintWords.Preprint}}`,
        submit_heading: `Submit {{preprintWords.Preprint}}`,
        edit_heading: `Edit {{preprintWords.Preprint}}`,
        body: {
            p_add: `For each section below, "Save and continue" will directly update the OSF project.`,
            p_edit: `For each section below, "Save and continue" will directly update the {{preprintWords.preprint}} and the OSF project.`,
            upload: `Upload new {{preprintWords.preprint}}`,
            connect: `Connect {{preprintWords.preprint}} to existing OSF project`,
            file: `{{preprintWords.Preprint}} file`,
            title: `{{preprintWords.Preprint}} title`,
            subjects_description: `Select a discipline and subdiscipline, if relevant. Add more by clicking on a new discipline or subdiscipline.`,
            remove_subject_aria: `Remove subject`,
            basics: {
                doi: {
                    label: `Peer-reviewed publication DOI (optional)`
                },
                keywords: {
                    label: `Keywords`,
                    paragraph: `Add keywords to increase discoverability of your {{preprintWords.preprint}}`
                },
                abstract: {
                    placeholder: `Add a brief summary of your {{preprintWords.preprint}}`
                },
                license: {
                    apply_license_title: `Apply this license to my OSF Project.`,
                    apply_license_text: `Selecting a license for your {{preprintWords.preprint}} does not automatically apply the license to your OSF project.`
                }
            },
            authors: {
                paragraph: `Add {{preprintWords.preprint}} authors and order them appropriately. All changes to authors are saved immediately. Search looks for authors that have OSF accounts already. Unregistered users can be added and invited to join the {{preprintWords.preprint}}.`
            },
            submit: {
                information: {
                    line1: {
                        default: `When you create this {{preprintWords.preprint}}, it will be assigned a DOI and become publicly accessible via {{name}}. The {{preprintWords.preprint}} file cannot be deleted, but it can be updated or modified. The related OSF project can be used to manage supplementary materials, appendices, data, or protocols for your {{preprintWords.preprint}}.`,
                        moderation: `When you submit this {{preprintWords.preprint}}, it will be assigned a DOI. The {{preprintWords.preprint}} file cannot be deleted, but it can be updated or modified. The related OSF project can be used to manage supplementary materials, appendices, data, or protocols for your {{preprintWords.preprint}}.`,
                    },
                    line2: {
                        create: `By creating this {{preprintWords.preprint}}, you confirm that all Contributors agree with sharing it, and that you have the right to share this {{preprintWords.preprint}}.`,
                        submit: `By submitting this {{preprintWords.preprint}}, you confirm that all Contributors agree with sharing it, and that you have the right to share this {{preprintWords.preprint}}.`
                    },
                    line3: {
                        pre: `{{name}} uses <strong>{{reviewsWorkflow}}</strong>, therefore your {{preprintWords.preprint}} will not become publicly accessible until a moderator accepts the submission.`,
                        post: `{{name}} uses <strong>{{reviewsWorkflow}}</strong>, therefore your {{preprintWords.preprint}} will become publicly accessible after creation and will only become private if rejected by a moderator.`,
                    }
                },
                invalid: {
                    description: `The following section(s) must be completed before submitting this {{preprintWords.preprint}}.`,
                    discipline: `Discipline`,
                    basics: `Basics`,
                    upload: `Upload`
                },
                submit_button: `Submit {{preprintWords.preprint}}`,
                create_button: `Create {{preprintWords.preprint}}`,
            },
            edit: {
                information: {
                    line1: {
                        pre: `{{name}} uses <strong>{{reviewsWorkflow}}</strong>, therefore your {{preprintWords.preprint}} will not become publicly accessible until a moderator accepts the submission.`,
                        post_rejected: `{{name}} uses <strong>{{reviewsWorkflow}}</strong>. Your {{preprintWords.preprint}} was rejected by a moderator so it will remain private.`,
                    },
                    line2: {
                        pre_pending: `Resubmitting may affect your position in the moderation queue.`,
                        pre_rejected: `Once you have addressed any moderator concerns, you may resubmit for review.`,
                        post_rejected: `If you have addressed all moderator concerns or believe there has been a mistake, please email <a>{{email}}</a> to discuss resubmission.`
                    }
                },
                resubmit_button: `Resubmit`,
                return_button: `Return to {{preprintWords.preprint}}`
            },
            save_continue: `Save and continue`,
        },
        could_not_update_title: `Error updating title. Please try again.`,
        error_copying_file: `Error copying file; please try again.`,
        error_accessing_parent_files: `Error accessing parent files. Please try again.`,
        could_not_create_component: `Could not create component. Please try again.`,
        abandoned_preprint_error: `Error with abandoned {{preprintWords.preprint}}.`,
        preprint_file_uploaded: `{{preprintWords.Preprint}} file uploaded!`,
        preprint_author_added: `{{preprintWords.Preprint}} author added!`,
        preprint_author_removed: `{{preprintWords.Preprint}} author removed!`,
        preprint_unregistered_author_added: `{{preprintWords.Preprint}} unregistered author added!`,
        error_adding_author: `Could not add author. Please try again.`,
        error_adding_unregistered_author: `Could not add unregistered author. Please try again.`,
        error_initiating_preprint: `Could not initiate {{preprintWords.preprint}}. Please try again.`,
        doi_error: `Error saving DOI`,
        basics_error: `Error saving basics fields.`,
        disciplines_error: `Error saving discipline(s).`,
        search_contributors_error: `Could not perform search query.`,
        error_completing_preprint: `Error completing {{preprintWords.preprint}}.`,
        error_saving_preprint: `Could not save {{preprintWords.preprint}}; please try again later`,
    },
    components: {
        'confirm-restart-submit-preprint': {
            title: `Restart {{preprintWords.Preprint}}`,
            body: `Are you sure you want to restart this {{preprintWords.preprint}}? Your uploaded file and supplemental information will be deleted.`
        },
        'confirm-share-preprint': {
            body: `Once this {{preprintWords.preprint}} is made public, you should assume that it will always be public. Even if you delete it, search engines or others may access the files before you do so.`,
            title: {
                submit: `Submit {{preprintWords.Preprint}}`,
                create: `Create {{preprintWords.Preprint}}`,
                resubmit: `Resubmit {{preprintWords.Preprint}}`
            }
        },
        'convert-or-copy': {
            organize_language_project: `You can organize your {{preprintWords.preprint}} by storing the file in this project or in its own new component.  If you select ‘Make a new component’,
            the {{preprintWords.preprint}} file will be stored in a new component inside this project.  If you select ‘Use the current project’, the {{preprintWords.preprint}} file will be stored in this project.
            If you are unsure, select ‘Make a new component’.`,
            organize_language_component: `You can organize your {{preprintWords.preprint}} by storing the file in this component or in its own new component.  If you select ‘Make a new component’,
            the {{preprintWords.preprint}} file will be stored in a new component inside this component.  If you select ‘Use the current component’, the {{preprintWords.preprint}} file will be stored in this component.
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
        'error-page': {
            email_message: `If this should not have occurred and the issue persists, please report it to`,
            go_to: `Go to {{brand}}`
        },
        'file-uploader': {
            dropzone_message: `Drop {{preprintWords.preprint}} file here to upload`,
            title_placeholder: `Enter {{preprintWords.preprint}} title`,
            update_version: `Update {{preprintWords.preprint}} file version.  File must have the same name as the original.`,
            could_not_create_project: `Could not create project. Please try again.`,
            could_not_create_component: `Could not create component. Please try again.`,
            could_not_update_title: `Could not update title. Please try again.`,
            version_error: `This is not a version of the current {{preprintWords.preprint}} file.`,
            preprint_file_updated: `{{preprintWords.Preprint}} file updated!`,
            preprint_file_error: `Could not set {{preprintWords.preprint}} file. Please try again.`,
            file_exists_error: `A file with that name already exists`,
            upload_error: `Upload Failed` ,
            dropzone_text_override: `Click or drag another {{preprintWords.preprint}} file to replace`,
        },
        'preprint-footer-branded': {
            twitter: 'Twitter',
            facebook: 'Facebook',
            instagram: 'Instagram',
            support: `Support`,
            contact: `Contact`
        },
        'permission-language':{
            arxiv_trademark_license,
            arxiv_non_endorsement: `${arxiv_trademark_license} This license should not be understood to indicate endorsement of content on {{provider}} by Cornell University or arXiv.`,
            no_trademark: ``
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
                in_citation: `In citation`,
                citation_info: `Citation Information`,
                parent_contributors: `Add contributors from parent project`,
                remove_author: `Remove author from authors list`
            },
            remove: `Remove`
        },
        'preprint-form-body': {
            // Nothing to translate
         },
        'preprint-form-header': {
            changes_saved: `Changes Saved!`,
            file: `{{preprintWords.Preprint}} file`,
            title: `{{preprintWords.Preprint}} title`,
            location: `{{preprintWords.Preprint}} location`,
            click_edit: `Click to Edit`,
            name: {
                Upload: 'Upload',
                Discipline: 'Discipline',
                Basics: 'Basics',
                Authors: 'Authors',
                Submit: 'Submit',
                Update: 'Update',
                choose_project: 'Choose Project',
                choose_file: 'Choose File',
                organize: 'Organize',
                finalize_upload: 'Finalize Upload',
                location_of_preprint: '{{preprintWords.Preprint}} Location',
                title_of_preprint: '{{preprintWords.Preprint}} Title',
                preprint_file: '{{preprintWords.Preprint}} File'
            }
        },
        'preprint-form-project-select': {
            existing_project_selector: `The list of projects appearing in the selector are projects and components for which you have admin access.  Registrations are not included here.`,
            no_valid_existing_nodes: `You have no available projects that can be converted into a {{preprintWords.preprint}}.  Go back to upload a new {{preprintWords.preprint}}.`,
            upload_preprint: `Upload {{preprintWords.preprint}}`,
            select_existing_file: `Select existing file as {{preprintWords.preprint}}`,
            edit_preprint_title_project: `Edit {{preprintWords.preprint}} title (will also become the name of the project)`,
            edit_preprint_title_component: `Edit {{preprintWords.preprint}} title (will also become the name of the component)`,
            initiate_preprint_process: `You have selected and organized your {{preprintWords.preprint}} file. Clicking "Save and continue" will immediately make changes to your OSF project. You will not be able to delete your {{preprintWords.Preprint}} file, but you will be able to update or modify it.`,
            edit_organize_section: `Edits to this {{preprintWords.preprint}} will update both the {{preprintWords.preprint}} and the OSF project.`,
            admin_only: `You must be the admin of this component to share it.  Please ask the admin of this project to make you an admin so you may share this component.`,
        },
        'preprint-form-section': {
            // Nothing to translate
        },
        'preprint-navbar': {
            toggle: `Toggle navigation`
        },
        'preprint-navbar-branded': {
            my_projects: `My OSF Projects`,
            headline: `On the OSF`,
        },
        'preprint-status-banner': {
            message: {
                base: `{{name}} uses {{reviewsWorkflow}}, therefore this preprint is`,
                pending_pre: `not publicly available or searchable until approved by a moderator`,
                pending_post: `publicly available and searchable but is subject to removal by a moderator`,
                accepted: `publicly available and searchable`,
                rejected: `not publicly available or searchable`,
            },
            pending: `pending`,
            accepted: `accepted`,
            rejected: `rejected`,
            feedback: {
                moderator_feedback: `Moderator feedback`,
                moderator: `Moderator`,
                base: `This {{preprintWords.preprint}} is`,
            },
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
        'search-facet-taxonomy': {
            // Nothing to translate
        },
        'unregistered-contributor-form': {
            full_name: `Full Name`,
            email: `Email`,
            paragraph: `We will notify the user that they have been added to your {{preprintWords.preprint}}.`

        },
        'validated-input': {
            // Nothing to translate
        },
    }
};
