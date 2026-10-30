import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateLocationSchema = z.object({
    locationId: z.string(),
    label: z.string(),
    hint: z.string().nullable().optional(),
});

const BindLocationSchema = z.object({
    formKey: z.string().nullable().optional(),
});

class CreateLocationRequestDto extends createZodDto(CreateLocationSchema) {}
class BindLocationRequestDto extends createZodDto(BindLocationSchema) {}

export { BindLocationRequestDto, CreateLocationRequestDto };
