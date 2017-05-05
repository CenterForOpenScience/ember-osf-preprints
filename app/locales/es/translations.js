const preprints = `Preprints`;
const brand = `OSF ${preprints}`;
const arxiv_trademark_license = 'arXiv is a trademark of Cornell University, used under license.';


export default {
    global: {
        share: `Compartir`,
        complete: `Completar`,
        cancel: `Cancelar`,
        discard: `Descartar cambios`,
        back: `Volver`,
        prev: `Anterior`,
        next: `Siguiente`,
        none: `Ninguno/a`,
        abstract: `Resúmen`,
        doi: `DOI`,
        tags: `Tags`,
        search: `Buscar`,
        preprints,
        brand,
        brand_name: 'OSF',
        provider_brand: `{{name}} ${preprints}`,
        add_preprint: `Agregar un preprint`,
        title: `Título`,
        search_preprints: `Buscar preprints...`,
        added_on: `Agregado en`,
        add: `Agregar`,
        restart: `Reiniciar`,
        no_results_found: `No se encontraron resultados.`,
        authors: `Autores`,
        convert_project: `Los preprints seran reorganizados en el proyecto actual`,
        convert_component: `Los preprints seran reorganizados en el componente actual`,
        copy_inside_project: `Los preprints serán reorganizados en un nuevo componente`,
        open_science_framework: `Open Science Framework`,
        license: 'Licencia',
    },
    application: {
        separator: ' | '
    },
    content: {
        header: {
            last_edited: `Ultima edición`
        },
        share: {
            download: `Descargar`,
            downloads: `Descargas`,
            download_file: `Descargar archivo`,
            download_preprint: `Descargar preprint`
        },
        see_more: 'ver más',
        see_less: 'ver menos',
        version: 'Versión',
        article_doi: `DOI del artículo`,
        citations: 'Citas',
        disciplines: `Disciplinas`,
        project_button: {
            paragraph: `El proyecto para este artículo está disponible en el OSF.`,
            button: `Visitar el proyecto`,
            edit_preprint:  `Editar el preprint`
        },
        orphan_preprint: `El usuario ha removido este archivo.`,
        private_preprint_warning: `Este preprint es privado. Hága que pueda ser descubierto haciéndolo`,
        public: `público`
    },
    discover: {
        search: {
            heading: `Búsqueda en el Archivo de Preprints`,
            paragraph: `utilizando`,
            partner: `Repositorios Asociados`,
            placeholder: `Buscar preprints...`
        },
        sort_by: `Ordenar por`,
        sort_newest_oldest: `Fecha modificada (reciente al más antiguo)`,
        sort_oldest_newest: `Fecha modificada (antiguo al más reciente)`,
        modified_on: `Modificada por`,
        relevance: `Pertinencia`,
        main: {
            active_filters: {
                heading: `Activar Filtros`,
                button: `Limpiar filtros`
            },
            refine: `Clarificar la búsqueda`,
            providers: `Proveedores`,
            subject: `Asunto`,
            box: {
                paragraph: `Quiere agregar su propio trabajo de investigación como un preprint?`,
                button: `Agregar su preprint`
            },
            results: {
                of: `de`,
                no_results: `Trate de ampliar sus términos de búsqueda`
            },
            otherRepositories: `Otros repositorios de preprint`,
        }
    },
    index: {
        header: {
            title: {
                paragraph: `La red <span class="f-w-lg">abierta</span> de repositorios de preprints`
            },
            powered_by: `Utilizando ${brand}`,
            search: `{{count}} preprints que pueden ser buscados`,
            as_of: `al día de`,
            example: `Ver un ejemplo`,
            or: `o`,
        },
        subjects: {
            heading: `Ver un catálogo <small>por tema</small>`
        },
        services: {
            top: {
                heading: `Servicios de Preprint`,
                paragraph: `Los servicios proveedores de preprints usan esta infrastructura open source para darle soporte a sus comunidades.`
            },
            bottom: {
                p1: `Crée su propio servidor de preprints bajo su propia marca utilizando OSF.`,
                div: {
                    line1: `Chequee el`,
                    linkText1: `código open source`,
                    line2: `y los`,
                    linkText2: `requerimientos y planes de trabajo`,
                    line3: `. Feedback bienvenido!`
                },
                contact: `Contáctenos`
            }
        },
        advisory: {
            heading: `Grupo Consejero`,
            paragraph: `Nuestro grupo consejero incluye líderes en preprints y comunicación académica`
        }
    },
    'page-not-found': {
        heading: `Página no encontrada`,
        message: `La página que Ud. está buscando no se encuentra en el servicio de {{brand}}.`,
        go_to: `Ir a {{brand}}`
    },
    'page-forbidden': {
        heading: `No permitido`,
        message: `El/La usuario/a ha restringido el acceso a esta página.`,
        go_to: `Ir a {{brand}}`
    },
    'resource-deleted': {
        heading: `Recurso borrado`,
        message: `El/La usuario/a ha borrado este contenido.`,
        go_to: `Ir a {{brand}}`
    },
    submit: {
        add_heading: `Agregar un Preprint`,
        edit_heading: `Editar un Preprint`,
        body: {
            p_add: `Siga estos simples cinco pasos para agregar su preprint al repositorio de preprints de {{name}}.`,
            p_edit: `Edite las secciones de su preprint más abajo.`,
            upload: `Suba su nuevo preprint`,
            connect: `Conecte el preprint a un proyecto ya existente de la OSF`,
            file: `Archivo preprint`,
            title: `Título del preprint`,
            subjects_description: `Seleccionar una disciplina y una subdisciplina, si fuera relevante. Agregar otras haciendo click en nueva disciplina o subdisciplina.`,
            remove_subject_aria: `Elimine disciplina`,
            basics: {
                doi: {
                    label: `Si ha sido publicado, DOI del artículo asociado (opcional)`
                },
                keywords: {
                    label: `Palabras clave`,
                    paragraph: `Agregar palabras claves para mejorar las chances de que su preprint sea descubierto`
                },
                abstract: {
                    placeholder: `Agregar un pequeño resúmen a su preprint`
                },
                license: {
                    apply_license_title: `Utilizar esta licencia a mi Proyecto OSF.`,
                    apply_license_text: `Selectionar una licencia para su preprint no aplica de manera automática la licencia a su proyecto OSF.`
                }
            },
            authors: {
                paragraph: `Agregar autores del preprint y ordenarlos de manera apropiada. Todos los cambios a los autores son grabados de manera inmediata. Buscar encuentra autores que ya tienen cuentas de OSF accounts already. Usuarios sin registro puede ser agregados e invitados a unirse al preprint.`
            },
            submit: {
                paragraph: {
                    line1: `Cuando Ud. comparta este preprint, estará disponible de manera inmediata vía {{name}} Preprints. No podrá borrar el archivo del preprint, pero puede actualizar o modificarlo. También create un proyecto OSF en caso de que quiera agregar contenido a su preprint como material suplementari, apendices, datos, o protocols. Si postear este preprint es su primera vez en el OSF, Ud. recibirá un email presentandole la OSF.`,
                    line2: `Haciendo clic en Compartir, Ud. confirma que todos colaboradores están de acuerdo en compartir esta preprint, y que tiene el derecho a compartirla. `,
                },
                invalid: {
                    description: `Las siguientes seccion(es) deben ser completadas antes de compartir su preprint.`,
                    discipline: `Disciplina`,
                    basics: `Campos básicos`,
                    upload: `Subir`
                }
            },
            update: {
                paragraph: `Ediciones a este preprint serán actualizadas al preprint y al proyecto OSF de manera automática y estarán disponibles públicamente vía {{name}} Preprints.`
            },
            save_continue: `Grabar y continuar`,
        },
        could_not_update_title: `Error al actualizar el título. Por favor, trate de nuevo.`,
        error_copying_file: `Error al copiar el archivo; por favor, trate de nuevo.`,
        error_accessing_parent_files: `Error al acceder archivos del padre. Por favor, trate de nuevo.`,
        could_not_create_component: `No pudo crearse un componente. Por favor, trate de nuevo.`,
        abandoned_preprint_error: `Error al abandonar el preprint.`,
        preprint_file_uploaded: `Archivo preprint cargado!`,
        preprint_author_added: `Autor de preprint añadido/a!`,
        preprint_author_removed: `Autor de preprint eliminado/a!`,
        preprint_unregistered_author_added: `Autor de preprint no registrado/a añadido/a!`,
        error_adding_author: `No puedo añadir autor. Por favor, trate de nuevo.`,
        error_adding_unregistered_author: `No puedo añadir autor no registrado/a. Por favor, trate de nuevo.`,
        error_initiating_preprint: `No puedo inicializar el preprint. Por favor, trate de nuevo.`,
        doi_error: `Error al grabar el DOI`,
        basics_error: `Error al grabar campos básicos.`,
        disciplines_error: `Error al grabar disciplina(s).`,
        search_contributors_error: `No se pudo realizar la búsqueda.`,
        error_completing_preprint: `Error completando el preprint.`,
        error_saving_preprint: `No se pudo grabar el preprint; por favor, trate de nuevo`,
    },
    components: {
        'confirm-restart-submit-preprint': {
            title: `Volver a empezar el Preprint`,
            body: `Está seguro que desea volver a comenzar este preprint? Su archivo cargado e información suplementaria serán borrados.`
        },
        'confirm-share-preprint': {
            title: `Compartir el Preprint`,
            body: `Una vez este preprint sea hecho públic, Ud. debe asumir que será siempre público. Aún si Ud. intenta borrarlo, los buscadores y otras personas pueden haber accedido a los archivos antes de que Ud. lo haga.`
        },
        'convert-or-copy': {
            organize_language_project: `Ud. puede organizar su preprint preprint almacenando el archivo en este proyecto o en su propio componente nuevo.  Si selecciona ‘Crear un componente nuevo’,
            el archivo del preprint será guardado en un componente nuevo dentro de este proyecto.  Si selecciona ‘Usar el proyecto actual’, el archivo del preprint será guardado en este proyecto.
            Si no está seguro, seleccione ‘Crear un componente nuevo’.`,
            organize_language_component: `Ud. puede organizar su preprint guardándo el archivo en este componente o en su propio componente nuevo.  Si selecciona ‘Crear un nuevo componente’,
            el archivo del preprint será guardado en un nuevo componente dentro de este proyecto.  Si selecciona ‘Usar el componente actual’, el archivo del preprint será guardado en este componente.
            Si no está seguro, seleccione ‘Crear un componente nuevo’.`,
            copy: `Crear un componente nuevo`,
            convert_project: `Usar el proyecto actual`,
            convert_component: `Usar el componente actual`,
            create_a_new_component: `Crear un componente nuevo`,
            continue_with_this_project: `Continuar con este proyecto`,
            continue_with_this_component: `Continuar con este componente`,
            header_convert_confirmation_project: `Los detalles de su proyecto serán grabados mientras que continua trabajando en este formulario.`,
            header_convert_confirmation_component: `Los detalles de su componente serán grabados mientras que continua trabajando en este formulario.`,
            convert_confirmation_details_project: `Los cambios que Ud. haga en esta página serán grabados inmediatamente.  Cree un componente nuevo bajo este proyecto para evitar reescribir sus detalles.`,
            convert_confirmation_details_component: `Los cambios que Ud. haga en esta página serán grabados inmediatamente.  Cree un componente nuevo bajo este componente para evitar reescribir sus detalles.`
        },
        'file-uploader': {
            dropzone_message: `Haga drag&drop un archivo del preprint que quiera cargar`,
            title_placeholder: `Entre el preprint del título`,
            update_version: `Actualizar la versión del archivo del preprint.  El archivo debe tener el mismo nombre que el original.`,
            could_not_create_project: `No se pudo crear el proyecto. Por favor, trate de nuevo.`,
            could_not_create_component: `No se pudo crear el componente. Por favor, trate de nuevo.`,
            could_not_update_title: `Could not update title. Por favor, trate de nuevo.`,
            version_error: `Esta no es una versión del archivo actual del preprint.`,
            preprint_file_updated: `Archivo del preprint actualizado!`,
            preprint_file_error: `No puedo actualizar el archivo del preprint. Por favor, trate de nuevo.`,
            file_exists_error: `Un archivo con ese nombre ya existe`,
            upload_error: `La carga falló` ,
            dropzone_text_override: `Haga click o drag&drop con otro archivo del preprint para ser reemplazado`,
        },
        'preprint-footer-branded': {
            twitter: 'Twitter',
            facebook: 'Facebook',
            instagram: 'Instagram',
            support: `Soporte`,
            contact: `Contacto`
        },
        'preprint-form-authors': {
            search: {
                placeholder: `Búsqueda por nombre`
            },
            unregistered_users: {
                paragraph: `¿No puede encontrar al usuario/a que está buscando?`,
                button: `Agregar un/a autor/a por dirección de email`
            },
            results: `Resultados`,
            yourself: `Ud. mismo`,
            already_added: `Ya ha sido agregado`,
            add_email: `Agregue al autor/a por email`,
            authors: {
                title: `Información sobre el Autor`,
                order_instructions: `Drag&drop los autores para cambiar el orden de autoría.`,
                name: `Nombre`,
                permissions: `Permisos`,
                permission_info: `Información de Permisos`,
                citation: `Citas`,
                in_citation: `En citas`,
                citation_info: `Información de Citas`,
                parent_contributors: `Agregar colaboradores del proyecto padre`,
                remove_author: `Elimina al autor/a`
            },
            remove: `Eliminar`
        },
        'preprint-form-body': {
            // Nothing to translate
         },
        'preprint-form-header': {
            changes_saved: `Cambios Guardados!`,
            file: `Archivo preprint`,
            title: `Título del preprint`,
            location: `Ubicación preprint`,
            click_edit: `Cliquear para Editar`,
            name: {
                Upload: 'Cargar',
                Discipline: 'Disciplinas',
                Basics: 'Campos Básicos',
                Authors: 'Autores',
                Submit: 'Enviar',
                Update: 'Actualizar',
                choose_project: 'Elegir un Proyecto',
                choose_file: 'Elegir un Archivo',
                organize: 'Organizar',
                finalize_upload: 'Finalizar la Carga',
                location_of_preprint: 'Ubicación del Preprint',
                title_of_preprint: 'Título del Preprint',
                preprint_file: 'Archivo del Preprint'
            }
        },
        'preprint-form-project-select': {
            existing_project_selector: `La lista de proyectos que aparecen en el seleccionador de proyectos y componentes para los cuales tiene acceso como administrador.  Registros no están incluídos.`,
            no_valid_existing_nodes: `No tiene proyectos disponibles que puedan ser convertidos en preprints.  Vuelva atrás para cargar un nuevo preprint.`,
            upload_preprint: `Cargar un preprint`,
            select_existing_file: `Seleccionar un archivo existente como un preprint`,
            edit_preprint_title_project: `Editar el título de un preprint (se transformará también en el nombre del proyecto)`,
            edit_preprint_title_component: `Editar el titulo del preprint (se transformará también en el nombre del componente)`,
            initiate_preprint_process: `Ud. ha seleccionado y organizado un archivo del preprint. Cliquear "Grabar y continuar" para cambiar su proyecto OSF de manera inmediata. No podrá borrar el archivo de preprint, pero Ud. podrá actualizarlo y modificarlo.`,
            edit_organize_section: `Cambios a este preprint actualizaran tanto el preprint como el proyecto OSF.`,
            admin_only: `Ud. debe ser el administrador de este componente para compartirlo.  Por favor, pídale al administrador de este proyecto que lo haga también administrador para que pueda compartir este componente.`,
        },
        'preprint-form-section': {
            // Nothing to translate
        },
        'preprint-navbar': {
            toggle: `Cambiar la navegación`
        },
        'preprint-navbar-branded': {
            my_projects: `Mis Proyectos OSF`,
            headline: `En la OSF`,
        },
        'project-chooser': {
            file_upload_create: `Cargar un archivo y crear un proyecto OSF`,
            provide_title: `Por favor, provea el título para su proyecto`,
            continue: `Continuar`,
            choose_project_component: `Elija un proyecto o componente existente`,
            file_upload_existing: `Cargar un archivo a un proyect OSF existente`,
            choose_project: `Elegir proyecto`,
            file_choose_existing: `Elegir un archivo desde un proyecto OSF existente`,
            choose_file: `Elegir archivo`
        },
        'search-preprints': {
            // Nothing to translate
        },
        'search-result': {
            // Nothing to translate
        },
        'error-page': {
            email_message: `Si ésto no debería haber ocurrido y el problema persiste, por favor reportarlo a`,
            go_to: `Ir a {{brand}}`
        },
        'share-popup': {
            tweet: `Tuitear`,
            post_facebook: `Publicar en Facebook`,
            share_linkedin: `Compartir en LinkedIn`,
            send_email: `Enviar por email`
        },
        'supplementary-file-browser': {
            primary: `Primario`
        },
        'permission-language':{
            arxiv_trademark_license,
            arxiv_non_endorsement: `${arxiv_trademark_license} This license should not be understood to indicate endorsement of content on {{provider}} by Cornell University or arXiv.`,
            no_trademark: ``
        },
        'taxonomy-top-list': {
            // Nothing to translate
        },
        'taxonomy-tree': {
            // Nothing to translate
        },
        'unregistered-contributor-form': {
            full_name: `Nombre Completo`,
            email: `Email`,
            paragraph: `Le notificaremos al usuario que han sido agregados al preprint.`

        },
        'validated-input': {
            // Nothing to translate
        },
    }
};
