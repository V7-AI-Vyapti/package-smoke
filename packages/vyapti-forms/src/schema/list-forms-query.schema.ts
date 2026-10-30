import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FORMS_LIST_DEFAULTS } from '../forms.constants.js';
import { PageQuerySchema } from './page-query.schema.js';

const ListFormsQuerySchema = PageQuerySchema.extend({
    sortBy: z
        .enum(['key', 'title', 'status', 'version'])
        .default(FORMS_LIST_DEFAULTS.FORM_SORT_BY),
});

class ListFormsQueryDto extends createZodDto(ListFormsQuerySchema) {}

export { ListFormsQueryDto, ListFormsQuerySchema };
