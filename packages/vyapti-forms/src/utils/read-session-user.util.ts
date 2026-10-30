import { UnauthorizedException } from '@nestjs/common';
import { FORMS_MESSAGES } from '../forms.constants.js';
import type { FormsRequest, FormsSessionUser } from '../types/forms.types.js';

function readSessionUser(request: FormsRequest): FormsSessionUser {
    if (typeof request.user !== 'object' || request.user === null) {
        throw new UnauthorizedException(FORMS_MESSAGES.UNAUTHORIZED);
    }

    const source = request.user as { id?: unknown };
    const id = readUserId(source.id);
    return { id };
}

function readUserId(value: unknown): string {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    throw new UnauthorizedException(FORMS_MESSAGES.UNAUTHORIZED);
}

export { readSessionUser };
