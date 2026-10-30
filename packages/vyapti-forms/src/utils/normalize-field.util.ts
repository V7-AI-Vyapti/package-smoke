import { FORMS_DEFAULTS, FORMS_ERROR_CODES, FORMS_MESSAGES } from '../forms.constants.js';
import type { FormField, FormFieldOption } from '../types/forms.types.js';
import { assertKeyShape } from './assert-identifier.util.js';
import { assertHint, assertLabel, blankToNull } from './assert-text.util.js';
import { throwFormError } from './throw-form-error.util.js';

const KNOWN_FIELD_KEYS = new Set([
    'key',
    'label',
    'widget',
    'stepId',
    'sectionId',
    'order',
    'required',
    'enabled',
    'placeholder',
    'hint',
    'options',
    'optionSource',
    'col',
    'span',
    'row',
    'spanLocked',
    'previousKey',
    'actor',
    'role',
]);

type NormalizedFieldInput = {
    field: FormField;
    previousKey: string | null;
    orderProvided: boolean;
};

function normalizeField(value: object): NormalizedFieldInput {
    const record = recordOf(value);
    const key = assertKeyShape(readString(record, 'key'));
    const previousKey = readPreviousKey(record);
    const order = readOptionalInt(record['order']);

    return {
        previousKey,
        orderProvided: order !== null,
        field: {
            key,
            label: assertLabel(readString(record, 'label')),
            widget: assertLabel(readString(record, 'widget')),
            stepId: assertKeyShape(readString(record, 'stepId')),
            sectionId: assertKeyShape(readString(record, 'sectionId')),
            order: order ?? 0,
            required: readBoolean(record['required'], false),
            enabled: readBoolean(record['enabled'], true),
            placeholder: blankToNull(readOptionalString(record['placeholder'])),
            hint: assertHint(readOptionalString(record['hint'])),
            options: readOptions(record['options']),
            optionSource: readOptionSource(record['optionSource']),
            col: readOptionalInt(record['col']),
            span: readOptionalInt(record['span']),
            row: readOptionalInt(record['row']),
            spanLocked: readBoolean(record['spanLocked'], false),
            extras: readExtras(record),
        },
    };
}

function readPreviousKey(record: Record<string, unknown>): string | null {
    const value = record['previousKey'];
    if (value == null || value === '') {
        return null;
    }
    if (typeof value !== 'string') {
        throwValueRequired();
    }
    return assertKeyShape(value);
}

function readOptionSource(value: unknown): string {
    if (value == null || value === '') {
        return FORMS_DEFAULTS.OPTION_SOURCE;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throwValueRequired();
    }
    return value.trim();
}

function readExtras(record: Record<string, unknown>): Record<string, unknown> {
    const extras: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
        if (!KNOWN_FIELD_KEYS.has(key)) {
            extras[key] = record[key];
        }
    }
    return extras;
}

function readOptions(value: unknown): FormFieldOption[] {
    if (value == null) {
        return [];
    }
    if (!Array.isArray(value)) {
        throwValueRequired();
    }
    const options: FormFieldOption[] = [];
    for (const item of value) {
        options.push(readOption(item));
    }
    return options;
}

function readOption(value: unknown): FormFieldOption {
    if (typeof value !== 'object' || value === null) {
        throwValueRequired();
    }
    const record = value as { id?: unknown; label?: unknown };
    return {
        id: assertLabel(readRequiredUnknown(record.id)),
        label: assertLabel(readRequiredUnknown(record.label)),
    };
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

function readRequiredUnknown(value: unknown): string {
    if (typeof value !== 'string') {
        throwValueRequired();
    }
    return value;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
    if (value == null) {
        return fallback;
    }
    if (typeof value !== 'boolean') {
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

export { normalizeField };
export type { NormalizedFieldInput };
