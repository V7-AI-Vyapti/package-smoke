import type { FormSection, FormStep, FormStructure } from '../types/forms.types.js';
import { assertKeyShape } from './assert-identifier.util.js';
import { assertHint, assertTitle } from './assert-text.util.js';
import { normalizeField } from './normalize-field.util.js';
import { throwFormError } from './throw-form-error.util.js';
import { FORMS_ERROR_CODES, FORMS_MESSAGES } from '../forms.constants.js';

type NormalizedStepInput = {
    step: FormStep;
    previousId: string | null;
    orderProvided: boolean;
};

function normalizeStructure(value: {
    steps: object[];
    sections: object[];
    fields: object[];
}): FormStructure {
    const steps: FormStep[] = [];
    const sections: FormSection[] = [];
    const fields: FormStructure['fields'] = [];

    for (let index = 0; index < value.steps.length; index += 1) {
        const normalized = normalizeStep(value.steps[index], index);
        steps.push(normalized.step);
    }
    for (let index = 0; index < value.sections.length; index += 1) {
        sections.push(normalizeSection(value.sections[index], index));
    }
    for (let index = 0; index < value.fields.length; index += 1) {
        const normalized = normalizeField(value.fields[index]);
        if (!normalized.orderProvided) {
            normalized.field.order = index;
        }
        fields.push(normalized.field);
    }

    return { steps, sections, fields };
}

function normalizeStep(value: object, fallbackOrder: number): NormalizedStepInput {
    const record = recordOf(value);
    const order = readOptionalInt(record['order']);
    return {
        previousId: readPreviousId(record),
        orderProvided: order !== null,
        step: {
            id: assertKeyShape(readString(record, 'id')),
            title: assertTitle(readString(record, 'title')),
            hint: assertHint(readOptionalString(record['hint'])),
            order: order ?? fallbackOrder,
        },
    };
}

function normalizeSection(value: object, fallbackOrder: number): FormSection {
    const record = recordOf(value);
    const order = readOptionalInt(record['order']);
    return {
        id: assertKeyShape(readString(record, 'id')),
        stepId: assertKeyShape(readString(record, 'stepId')),
        title: assertTitle(readString(record, 'title')),
        hint: assertHint(readOptionalString(record['hint'])),
        order: order ?? fallbackOrder,
    };
}

function readPreviousId(record: Record<string, unknown>): string | null {
    const value = record['previousId'];
    if (value == null || value === '') {
        return null;
    }
    if (typeof value !== 'string') {
        throwValueRequired();
    }
    return assertKeyShape(value);
}

function readString(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    if (typeof value !== 'string') {
        throwValueRequired();
    }
    return value;
}

function readOptionalString(value: unknown): string | null {
    if (value == null) {
        return null;
    }
    if (typeof value !== 'string') {
        throwValueRequired();
    }
    return value;
}

function readOptionalInt(value: unknown): number | null {
    if (value == null) {
        return null;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throwValueRequired();
    }
    return value;
}

function recordOf(value: object): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
        record[key] = (value as Record<string, unknown>)[key];
    }
    return record;
}

function throwValueRequired(): never {
    throwFormError({
        status: 'bad_request',
        code: FORMS_ERROR_CODES.VALUE_REQUIRED,
        message: FORMS_MESSAGES.VALUE_REQUIRED,
    });
}

export { normalizeSection, normalizeStep, normalizeStructure };
export type { NormalizedStepInput };
