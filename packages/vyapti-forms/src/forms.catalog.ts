import { FORM_ACTIONS, FORM_RESOURCES } from './forms.constants.js';

const FORM_PERMISSION_CATALOG = [
    {
        resource: FORM_RESOURCES.FORM,
        actions: [
            FORM_ACTIONS.CREATE,
            FORM_ACTIONS.UPDATE,
            FORM_ACTIONS.PUBLISH,
        ],
    },
    {
        resource: FORM_RESOURCES.FORM_LOCATION,
        actions: [
            FORM_ACTIONS.CREATE,
            FORM_ACTIONS.UPDATE,
            FORM_ACTIONS.DELETE,
        ],
    },
] as const;

export { FORM_PERMISSION_CATALOG };
