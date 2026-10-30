import { FORMS_DEFAULTS } from '../forms.constants.js';
import type { FormStructure } from '../types/forms.types.js';

function initialFormStructure(): FormStructure {
    return {
        steps: [
            {
                id: FORMS_DEFAULTS.MAIN_STEP_ID,
                title: FORMS_DEFAULTS.MAIN_TITLE,
                hint: null,
                order: 0,
            },
        ],
        sections: [
            {
                id: FORMS_DEFAULTS.MAIN_SECTION_ID,
                stepId: FORMS_DEFAULTS.MAIN_STEP_ID,
                title: FORMS_DEFAULTS.MAIN_TITLE,
                hint: null,
                order: 0,
            },
        ],
        fields: [],
    };
}

export { initialFormStructure };
