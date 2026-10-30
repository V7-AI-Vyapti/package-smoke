import { readString } from '@vulcan/shared/utils/record-readers';
import { fromIsoDateString } from '@auth/utils/iso-date.util';
import { readNullableString } from '@auth/utils/read-nullable-string.util';
import type { LocationRecord } from '@vyapti/forms';

function mapLocationRecord(row: unknown): LocationRecord {
    return {
        locationId: readString(row, 'location_id'),
        label: readString(row, 'label'),
        hint: readNullableString(row, 'hint'),
        formKey: readNullableString(row, 'form_key'),
        updatedBy: readNullableString(row, 'updated_by'),
        updatedAt: fromIsoDateString(readString(row, 'updated_at')),
    };
}

export { mapLocationRecord };
