import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const FormKeyParamsSchema = z.object({
    key: z.string(),
});

const FieldParamsSchema = z.object({
    key: z.string(),
    fieldKey: z.string(),
});

const StepParamsSchema = z.object({
    key: z.string(),
    stepId: z.string(),
});

const LocationIdParamsSchema = z.object({
    id: z.string(),
});

class FormKeyParamsDto extends createZodDto(FormKeyParamsSchema) {}
class FieldParamsDto extends createZodDto(FieldParamsSchema) {}
class StepParamsDto extends createZodDto(StepParamsSchema) {}
class LocationIdParamsDto extends createZodDto(LocationIdParamsSchema) {}

export {
    FieldParamsDto,
    FormKeyParamsDto,
    LocationIdParamsDto,
    StepParamsDto,
};
