import { readString } from '@vulcan/shared/utils/record-readers';
import type { TemplateRecord } from '@vyapti/forms';
import { readJsonObject } from './read-json.util';

function mapTemplateRecord(row: unknown): TemplateRecord {
    return {
        templateId: readString(row, 'template_id'),
        title: readString(row, 'title'),
        field: readJsonObject(row, 'field'),
    };
}

export { mapTemplateRecord };
