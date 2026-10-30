const GENERATED_FORMS_ENTITY_NAMES = {
    FORM: 'form_definition',
    LOCATION: 'form_location',
    TEMPLATE: 'form_field_template',
    USER: 'user',
    ROLE: 'role',
    RBAC_CATALOG: 'rbac_catalog',
} as const;

const GENERATED_FORMS_ADMIN_ROLE_NAME = 'Admin';

const GENERATED_FORMS_FIELD_LIMITS = {
    KEY: 100,
    LOCATION_ID: 200,
    TITLE: 200,
    LABEL: 200,
    DESCRIPTION: 2000,
    HINT: 500,
    TEMPLATE_ID: 100,
} as const;

const FORM_SORT_COLUMNS = {
    key: 'form_key',
    title: 'title',
    status: 'status',
    version: 'version',
} as const;

const LOCATION_SORT_COLUMNS = {
    locationId: 'location_id',
    label: 'label',
} as const;

const TEMPLATE_SORT_COLUMNS = {
    templateId: 'template_id',
    title: 'title',
} as const;

export {
    FORM_SORT_COLUMNS,
    GENERATED_FORMS_ADMIN_ROLE_NAME,
    GENERATED_FORMS_ENTITY_NAMES,
    GENERATED_FORMS_FIELD_LIMITS,
    LOCATION_SORT_COLUMNS,
    TEMPLATE_SORT_COLUMNS,
};
