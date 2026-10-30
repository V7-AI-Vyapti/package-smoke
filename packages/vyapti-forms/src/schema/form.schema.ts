import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FORM_KIND } from '../forms.constants.js';

const CreateFormSchema = z.object({
    key: z.string(),
    title: z.string(),
    kind: z.enum([FORM_KIND.STEPPER, FORM_KIND.SINGLE_PAGE]).optional(),
    locationId: z.string().optional(),
    description: z.string().nullable().optional(),
    brandImage: z.string(),
    brandDetailRequired: z.boolean().optional(),
});

const FormFieldOptionSchema = z.object({
    id: z.string(),
    label: z.string(),
});

const FormFieldSchema = z.looseObject({
    key: z.string(),
    label: z.string(),
    widget: z.string(),
    stepId: z.string(),
    sectionId: z.string(),
    order: z.number().int().optional(),
    required: z.boolean().optional(),
    enabled: z.boolean().optional(),
    placeholder: z.string().nullable().optional(),
    hint: z.string().nullable().optional(),
    options: z.array(FormFieldOptionSchema).optional(),
    optionSource: z.string().optional(),
    col: z.number().int().optional(),
    span: z.number().int().optional(),
    row: z.number().int().optional(),
    spanLocked: z.boolean().optional(),
    previousKey: z.string().optional(),
});

const FormStepSchema = z.object({
    id: z.string(),
    title: z.string(),
    hint: z.string().nullable().optional(),
    order: z.number().int().optional(),
    previousId: z.string().optional(),
});

const FormSectionSchema = z.object({
    id: z.string(),
    stepId: z.string(),
    title: z.string(),
    hint: z.string().nullable().optional(),
    order: z.number().int().optional(),
});

const SaveFormStructureSchema = z.object({
    steps: z.array(FormStepSchema),
    sections: z.array(FormSectionSchema),
    fields: z.array(FormFieldSchema),
});

class CreateFormRequestDto extends createZodDto(CreateFormSchema) {}
class SaveFormStructureRequestDto extends createZodDto(SaveFormStructureSchema) {}
class UpsertFieldRequestDto extends createZodDto(FormFieldSchema) {}
class UpsertStepRequestDto extends createZodDto(FormStepSchema) {}

export {
    CreateFormRequestDto,
    SaveFormStructureRequestDto,
    UpsertFieldRequestDto,
    UpsertStepRequestDto,
};
