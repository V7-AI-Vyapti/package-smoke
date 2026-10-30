import {
    FORMS_ERROR_CODES,
    FORMS_LIMITS,
    FORMS_MESSAGES,
} from '../forms.constants.js';
import { throwFormError } from './throw-form-error.util.js';

function blankToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length === 0) {
        return null;
    }
    return trimmed;
}

function assertBoundedText(args: {
    value: string;
    max: number;
    message: string;
}): string {
    const trimmed = args.value.trim();
    if (trimmed.length === 0 || trimmed.length > args.max) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: args.message,
        });
    }
    return trimmed;
}

function assertTitle(value: string): string {
    return assertBoundedText({
        value,
        max: FORMS_LIMITS.TITLE,
        message: FORMS_MESSAGES.VALUE_REQUIRED,
    });
}

function assertLabel(value: string): string {
    return assertBoundedText({
        value,
        max: FORMS_LIMITS.LABEL,
        message: FORMS_MESSAGES.VALUE_REQUIRED,
    });
}

function assertDescription(value: string | null | undefined): string | null {
    const trimmed = blankToNull(value);
    if (trimmed && trimmed.length > FORMS_LIMITS.DESCRIPTION) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.VALUE_REQUIRED,
        });
    }
    return trimmed;
}

function assertHint(value: string | null | undefined): string | null {
    const trimmed = blankToNull(value);
    if (trimmed && trimmed.length > FORMS_LIMITS.HINT) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.VALUE_REQUIRED,
        });
    }
    return trimmed;
}

export { assertDescription, assertHint, assertLabel, assertTitle, blankToNull };
