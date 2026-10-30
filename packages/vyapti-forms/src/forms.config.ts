const FORMS_ROUTE_PATHS = {
    ROOT: '',
    BY_KEY: ':key',
    PUBLISH: ':key/publish',
    FIELDS: ':key/fields',
    FIELD_REMOVE: ':key/fields/:fieldKey/remove',
    STEPS: ':key/steps',
    STEP_REMOVE: ':key/steps/:stepId/remove',
    LOCATIONS: 'locations',
    LOCATION_BY_ID: 'locations/:id',
    LOCATION_REMOVE: 'locations/:id/remove',
    TEMPLATES: 'templates',
} as const;

export { FORMS_ROUTE_PATHS };
