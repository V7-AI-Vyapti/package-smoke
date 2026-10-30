import {
    BRAND_BASE64_MARKER,
    DATA_IMAGE_PREFIX,
    FORMS_ERROR_CODES,
    FORMS_LIMITS,
    FORMS_MESSAGES,
} from '../forms.constants.js';
import { throwFormError } from './throw-form-error.util.js';

const BRAND_IMAGE_MAX_CHARS = FORMS_LIMITS.BRAND_IMAGE_MAX_BYTES * 2;

function assertBrandImage(value: string): string {
    const brandImage = value.trim();
    if (
        brandImage.length === 0 ||
        brandImage.length > BRAND_IMAGE_MAX_CHARS ||
        !brandImage.startsWith(DATA_IMAGE_PREFIX)
    ) {
        throwInvalidBrand();
    }

    const markerIndex = brandImage.indexOf(BRAND_BASE64_MARKER);
    if (markerIndex < 0) {
        throwInvalidBrand();
    }

    const payload = brandImage.slice(markerIndex + BRAND_BASE64_MARKER.length);
    const bytes = Buffer.from(payload, 'base64');
    if (
        bytes.length === 0 ||
        bytes.length > FORMS_LIMITS.BRAND_IMAGE_MAX_BYTES
    ) {
        throwInvalidBrand();
    }
    return brandImage;
}

function throwInvalidBrand(): never {
    throwFormError({
        status: 'bad_request',
        code: FORMS_ERROR_CODES.VALUE_REQUIRED,
        message: FORMS_MESSAGES.BRAND_INVALID,
    });
}

export { assertBrandImage };
