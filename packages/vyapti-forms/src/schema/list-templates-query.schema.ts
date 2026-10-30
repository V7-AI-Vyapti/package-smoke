import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FORMS_LIST_DEFAULTS } from '../forms.constants.js';
import { PageQuerySchema } from './page-query.schema.js';

const ListTemplatesQuerySchema = PageQuerySchema.extend({
    sortBy: z
        .enum(['templateId', 'title'])
        .default(FORMS_LIST_DEFAULTS.TEMPLATE_SORT_BY),
});

class ListTemplatesQueryDto extends createZodDto(ListTemplatesQuerySchema) {}

export { ListTemplatesQueryDto, ListTemplatesQuerySchema };
