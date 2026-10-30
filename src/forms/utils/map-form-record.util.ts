import {
    readBoolean,
    readNumber,
    readString,
} from '@vulcan/shared/utils/record-readers';
import { fromIsoDateString } from '@auth/utils/iso-date.util';
import { readNullableString } from '@auth/utils/read-nullable-string.util';
import type {
    FormField,
    FormKind,
    FormRecord,
    FormSection,
    FormStatus,
    FormStep,
} from '@vyapti/forms';
import { readJsonArray } from './read-json.util';

function mapFormRecord(row: unknown): FormRecord {
    return {
        key: readString(row, 'form_key'),
        title: readString(row, 'title'),
        description: readNullableString(row, 'description'),
        brandImage: readString(row, 'brand_image'),
        brandDetailRequired: readBoolean(row, 'brand_detail_required'),
        kind: readString(row, 'kind') as FormKind,
        status: readString(row, 'status') as FormStatus,
        version: readNumber(row, 'version'),
        steps: readJsonArray<FormStep>(row, 'steps'),
        sections: readJsonArray<FormSection>(row, 'sections'),
        fields: readJsonArray<FormField>(row, 'fields'),
        updatedBy: readNullableString(row, 'updated_by'),
        updatedAt: fromIsoDateString(readString(row, 'updated_at')),
    };
}

export { mapFormRecord };
