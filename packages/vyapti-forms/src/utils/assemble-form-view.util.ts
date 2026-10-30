import type { FormRecord, FormView } from '../types/forms.types.js';

function assembleFormView(args: {
    form: FormRecord;
    locationIds: string[];
}): FormView {
    const locationIds: string[] = [];
    for (const locationId of args.locationIds) {
        locationIds.push(locationId);
    }
    return { ...args.form, locationIds };
}

function readStructure(form: FormRecord): {
    steps: FormRecord['steps'];
    sections: FormRecord['sections'];
    fields: FormRecord['fields'];
} {
    return {
        steps: form.steps,
        sections: form.sections,
        fields: form.fields,
    };
}

export { assembleFormView, readStructure };
