import { z } from 'zod';
import { GENERATED_FORMS_FIELD_LIMITS } from '../forms.constants';

const FormLocationCreateSchema = z.object({
    location_id: z
        .string()
        .trim()
        .min(1)
        .max(GENERATED_FORMS_FIELD_LIMITS.LOCATION_ID),
    label: z.string().trim().min(1).max(GENERATED_FORMS_FIELD_LIMITS.LABEL),
    hint: z
        .string()
        .trim()
        .max(GENERATED_FORMS_FIELD_LIMITS.HINT)
        .nullable(),
    form_key: z
        .string()
        .trim()
        .min(1)
        .max(GENERATED_FORMS_FIELD_LIMITS.KEY)
        .nullable(),
    updated_by: z.string().trim().min(1).max(64),
    updated_at: z.string().trim().min(1).max(64),
});

const FormLocationBindSchema = z.object({
    form_key: z
        .string()
        .trim()
        .min(1)
        .max(GENERATED_FORMS_FIELD_LIMITS.KEY)
        .nullable(),
    updated_by: z.string().trim().min(1).max(64),
    updated_at: z.string().trim().min(1).max(64),
});

export { FormLocationBindSchema, FormLocationCreateSchema };
