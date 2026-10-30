import { z } from 'zod';
import { GENERATED_FORMS_FIELD_LIMITS } from '../forms.constants';

const FormFieldTemplateCreateSchema = z.object({
    template_id: z
        .string()
        .trim()
        .min(1)
        .max(GENERATED_FORMS_FIELD_LIMITS.TEMPLATE_ID),
    title: z.string().trim().min(1).max(GENERATED_FORMS_FIELD_LIMITS.TITLE),
    field: z.record(z.string(), z.unknown()),
});

export { FormFieldTemplateCreateSchema };
