import { buildEntitySchema } from '@vyapti/core';
import { FormDefinition } from './form_definition.entity';
import { FormFieldTemplate } from './form_field_template.entity';
import { FormLocation } from './form_location.entity';

const entitySchemas = [
    buildEntitySchema(FormDefinition),
    buildEntitySchema(FormLocation),
    buildEntitySchema(FormFieldTemplate),
];

export {
    FormDefinition,
    FormFieldTemplate,
    FormLocation,
    entitySchemas,
};
