import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { FORMS_LIST_DEFAULTS } from '../forms.constants.js';
import { PageQuerySchema } from './page-query.schema.js';

const ListLocationsQuerySchema = PageQuerySchema.extend({
    sortBy: z
        .enum(['locationId', 'label'])
        .default(FORMS_LIST_DEFAULTS.LOCATION_SORT_BY),
});

class ListLocationsQueryDto extends createZodDto(ListLocationsQuerySchema) {}

export { ListLocationsQueryDto, ListLocationsQuerySchema };
