import { z } from 'zod';
import { FORMS_LIST_DEFAULTS } from '../forms.constants.js';

const PageQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(FORMS_LIST_DEFAULTS.PAGE),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(FORMS_LIST_DEFAULTS.MAX_LIMIT)
        .default(FORMS_LIST_DEFAULTS.LIMIT),
    search: z.string().trim().optional().nullable(),
    sortOrder: z.enum(['ASC', 'DESC']).default(FORMS_LIST_DEFAULTS.SORT_ORDER),
});

export { PageQuerySchema };
