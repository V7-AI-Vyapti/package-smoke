import type {
    FormField,
    FormSection,
    FormStep,
    FormView,
} from '../types/forms.types.js';

type FormFieldResponse = {
    key: string;
    label: string;
    widget: string;
    stepId: string;
    sectionId: string;
    order: number;
    required: boolean;
    enabled: boolean;
    placeholder: string | null;
    hint: string | null;
    options: FormField['options'];
    optionSource: string;
    spanLocked: boolean;
    col?: number;
    span?: number;
    row?: number;
    [extra: string]: unknown;
};

type FormResponse = {
    key: string;
    title: string;
    description: string | null;
    brandImage: string;
    brandDetailRequired: boolean;
    kind: FormView['kind'];
    status: FormView['status'];
    version: number;
    steps: FormStep[];
    sections: FormSection[];
    fields: FormFieldResponse[];
    locationIds: string[];
    updatedBy: string | null;
    updatedAt: string;
};

function serializeForm(form: FormView): FormResponse {
    const fields: FormFieldResponse[] = [];
    for (const field of form.fields) {
        fields.push(serializeField(field));
    }
    return {
        key: form.key,
        title: form.title,
        description: form.description,
        brandImage: form.brandImage,
        brandDetailRequired: form.brandDetailRequired,
        kind: form.kind,
        status: form.status,
        version: form.version,
        steps: form.steps,
        sections: form.sections,
        fields,
        locationIds: form.locationIds,
        updatedBy: form.updatedBy,
        updatedAt: toIsoString(form.updatedAt),
    };
}

function serializeForms(forms: FormView[]): FormResponse[] {
    const responses: FormResponse[] = [];
    for (const form of forms) {
        responses.push(serializeForm(form));
    }
    return responses;
}

function serializeField(field: FormField): FormFieldResponse {
    const response: FormFieldResponse = {
        ...field.extras,
        key: field.key,
        label: field.label,
        widget: field.widget,
        stepId: field.stepId,
        sectionId: field.sectionId,
        order: field.order,
        required: field.required,
        enabled: field.enabled,
        placeholder: field.placeholder,
        hint: field.hint,
        options: field.options,
        optionSource: field.optionSource,
        spanLocked: field.spanLocked,
    };
    if (field.col !== null) {
        response.col = field.col;
    }
    if (field.span !== null) {
        response.span = field.span;
    }
    if (field.row !== null) {
        response.row = field.row;
    }
    return response;
}

function toIsoString(value: Date | string): string {
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}

export { serializeForm, serializeForms, toIsoString };
export type { FormResponse };
