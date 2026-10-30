import {
    FORM_KEY_PATTERN,
    FORMS_ERROR_CODES,
    FORMS_LIMITS,
    FORMS_MESSAGES,
    LOCATION_ID_PATTERN,
} from '../forms.constants.js';
import { throwFormError } from './throw-form-error.util.js';

const RESERVED_FORM_KEYS = new Set(['locations', 'templates']);

function assertKeyShape(value: string): string {
    const trimmed = value.trim();
    if (
        trimmed.length === 0 ||
        trimmed.length > FORMS_LIMITS.KEY ||
        !FORM_KEY_PATTERN.test(trimmed)
    ) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.KEY_INVALID,
        });
    }
    return trimmed;
}

function assertFormKey(value: string): string {
    const key = assertKeyShape(value);
    if (RESERVED_FORM_KEYS.has(key)) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.KEY_RESERVED,
        });
    }
    return key;
}

function assertLocationId(value: string): string {
    const trimmed = value.trim();
    if (
        trimmed.length === 0 ||
        trimmed.length > FORMS_LIMITS.LOCATION_ID ||
        !LOCATION_ID_PATTERN.test(trimmed)
    ) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.LOCATION_ID_INVALID,
        });
    }
    return trimmed;
}

function resolveOptionalFormKey(value: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length === 0) {
        return null;
    }
    return assertFormKey(trimmed);
}

export { assertFormKey, assertKeyShape, assertLocationId, resolveOptionalFormKey };
