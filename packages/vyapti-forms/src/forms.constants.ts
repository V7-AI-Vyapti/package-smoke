const API_METHOD_TYPES = {
    POST: 'post',
    GET: 'get',
} as const;

const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
} as const;

const FORMS_ERROR_CODES = {
    LOCATION_REQUIRED: 'LOCATION_REQUIRED',
    NOT_PUBLISHED: 'NOT_PUBLISHED',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_KEY: 'DUPLICATE_KEY',
    LAST_STEP: 'LAST_STEP',
    STEP_IN_USE: 'STEP_IN_USE',
    VALUE_REQUIRED: 'VALUE_REQUIRED',
} as const;

const FORM_RESOURCES = {
    FORM: 'form',
    FORM_LOCATION: 'form_location',
} as const;

const FORM_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    PUBLISH: 'publish',
    DELETE: 'delete',
} as const;

const FORM_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
} as const;

const FORM_KIND = {
    STEPPER: 'stepper',
    SINGLE_PAGE: 'single_page',
} as const;

const FORM_EVENTS = {
    CREATED: 'form.created',
    PUBLISHED: 'form.published',
    SAVED: 'form.saved',
    FIELD_SAVED: 'form.field_saved',
    FIELD_REMOVED: 'form.field_removed',
    STEP_SAVED: 'form.step_saved',
    STEP_REMOVED: 'form.step_removed',
    LOCATION_CREATED: 'form.location_created',
    LOCATION_BOUND: 'form.location_bound',
    LOCATION_UPDATED: 'form.location_updated',
    LOCATION_REMOVED: 'form.location_removed',
} as const;

const FORM_ENTITY = {
    FORM: 'form',
    FORM_LOCATION: 'form_location',
} as const;

const FORMS_LIMITS = {
    KEY: 100,
    LOCATION_ID: 200,
    TITLE: 200,
    LABEL: 200,
    DESCRIPTION: 2000,
    HINT: 500,
    BRAND_IMAGE_MAX_BYTES: 400 * 1024,
} as const;

const FORMS_LIST_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
    SORT_ORDER: 'ASC',
    FORM_SORT_BY: 'key',
    LOCATION_SORT_BY: 'locationId',
    TEMPLATE_SORT_BY: 'templateId',
} as const;

const FORMS_DEFAULTS = {
    FORBIDDEN_AS: '404',
    KIND: FORM_KIND.STEPPER,
    BRAND_DETAIL_REQUIRED: true,
    OPTION_SOURCE: 'static',
    VERSION: 1,
    MAIN_STEP_ID: 'main',
    MAIN_SECTION_ID: 'main',
    MAIN_TITLE: 'Main',
} as const;

const FORMS_MESSAGES = {
    ACCESS_DENIED: 'Resource not found',
    UNAUTHORIZED: 'Authentication required',
    PERSISTENCE_REQUIRED: 'FormBuilderModule.forRoot requires a persistence adapter',
    CONFIGURE_REQUIRED:
        'FormBuilderModule.forRoot requires canConfigureForms',
    ROUTE_PREFIX_REQUIRED: 'FormBuilderModule.forRoot requires a route prefix',
    FORBIDDEN_AS_UNSUPPORTED: 'Form builder forbidden responses must be 404',
    FORMS_FETCHED: 'Forms fetched',
    FORM_FETCHED: 'Form fetched',
    FORM_CREATED: 'Form created',
    FORM_SAVED: 'Form saved',
    FORM_PUBLISHED: 'Form published',
    FIELD_SAVED: 'Field saved',
    FIELD_REMOVED: 'Field removed',
    STEP_SAVED: 'Step saved',
    STEP_REMOVED: 'Step removed',
    LOCATIONS_FETCHED: 'Locations fetched',
    LOCATION_FETCHED: 'Published form fetched',
    LOCATION_CREATED: 'Location created',
    LOCATION_UPDATED: 'Location updated',
    LOCATION_REMOVED: 'Location removed',
    TEMPLATES_FETCHED: 'Templates fetched',
    FORM_NOT_FOUND: 'Form not found',
    LOCATION_NOT_FOUND: 'Location not found',
    LOCATION_UNBOUND: 'Location is not bound to a form',
    FIELD_NOT_FOUND: 'Field not found',
    STEP_NOT_FOUND: 'Step not found',
    NOT_PUBLISHED: 'Form is not published',
    LOCATION_REQUIRED: 'Publish requires a bound location',
    DUPLICATE_KEY: 'This key is already in use',
    LAST_STEP: 'A form must keep at least one step',
    STEP_IN_USE: 'Remove the fields on this step first',
    VALUE_REQUIRED: 'A required value is missing or invalid',
    KEY_INVALID:
        'Key must start with a letter and use only letters, numbers, and underscores',
    KEY_RESERVED: 'Key cannot be locations or templates',
    LOCATION_ID_INVALID:
        'Location id must start with a letter and may include dots',
    BRAND_INVALID: 'Brand image must be a data:image file up to 400 KiB',
    PLACEMENT_INVALID: 'Field placement does not match a step and section',
    FORM_KEY_REQUIRED: 'Form key is required',
} as const;

const FORMS_TAGS: string[] = ['Forms'];

const FORM_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const LOCATION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_.]*$/;
const DATA_IMAGE_PREFIX = 'data:image/';
const BRAND_BASE64_MARKER = ';base64,';

export {
    API_METHOD_TYPES,
    BRAND_BASE64_MARKER,
    DATA_IMAGE_PREFIX,
    FORM_ACTIONS,
    FORM_ENTITY,
    FORM_EVENTS,
    FORM_KEY_PATTERN,
    FORM_KIND,
    FORM_RESOURCES,
    FORM_STATUS,
    FORMS_DEFAULTS,
    FORMS_ERROR_CODES,
    FORMS_LIMITS,
    FORMS_LIST_DEFAULTS,
    FORMS_MESSAGES,
    FORMS_TAGS,
    HTTP_STATUS_CODES,
    LOCATION_ID_PATTERN,
};
