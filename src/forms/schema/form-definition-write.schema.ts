import { z } from 'zod';
import { GENERATED_FORMS_FIELD_LIMITS } from '../forms.constants';

const JsonArraySchema = z.array(z.unknown());

const FormDefinitionCreateSchema = z.object({
    form_key: z.string().trim().min(1).max(GENERATED_FORMS_FIELD_LIMITS.KEY),
    title: z.string().trim().min(1).max(GENERATED_FORMS_FIELD_LIMITS.TITLE),
    description: z
        .string()
        .trim()
        .max(GENERATED_FORMS_FIELD_LIMITS.DESCRIPTION)
        .nullable(),
    brand_image: z.string().min(1),
    brand_detail_required: z.boolean(),
    kind: z.string().trim().min(1).max(32),
    status: z.string().trim().min(1).max(32),
    version: z.number().int().positive(),
    steps: JsonArraySchema,
    sections: JsonArraySchema,
    fields: JsonArraySchema,
    updated_by: z.string().trim().min(1).max(64),
    updated_at: z.string().trim().min(1).max(64),
});

const FormDefinitionStructureUpdateSchema = z.object({
    steps: JsonArraySchema,
    sections: JsonArraySchema,
    fields: JsonArraySchema,
    version: z.number().int().positive(),
    updated_by: z.string().trim().min(1).max(64),
    updated_at: z.string().trim().min(1).max(64),
});

const FormDefinitionStatusUpdateSchema = z.object({
    status: z.string().trim().min(1).max(32),
    version: z.number().int().positive().optional(),
    updated_by: z.string().trim().min(1).max(64),
    updated_at: z.string().trim().min(1).max(64),
});

export {
    FormDefinitionCreateSchema,
    FormDefinitionStatusUpdateSchema,
    FormDefinitionStructureUpdateSchema,
};
