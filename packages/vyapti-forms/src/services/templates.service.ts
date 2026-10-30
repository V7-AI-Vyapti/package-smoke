import { Inject, Injectable } from '@nestjs/common';
import { FORMS_PERSISTENCE_ADAPTER } from '../forms.tokens.js';
import type { TemplateRecord } from '../types/forms.types.js';
import type {
    FormsPersistenceAdapter,
    TemplateListArgs,
} from '../types/persistence.types.js';
import { normalizeSearch } from '../utils/normalize-search.util.js';

type ListTemplatesArgs = {
    page: number;
    limit: number;
    search?: string | null;
    sortBy: TemplateListArgs['sortBy'];
    sortOrder: TemplateListArgs['sortOrder'];
};

@Injectable()
class TemplatesService {
    constructor(
        @Inject(FORMS_PERSISTENCE_ADAPTER)
        private readonly persistence: FormsPersistenceAdapter,
    ) {}

    async list(args: ListTemplatesArgs): Promise<{
        rows: TemplateRecord[];
        total: number;
        page: number;
        limit: number;
    }> {
        const result = await this.persistence.listTemplates({
            search: normalizeSearch(args.search),
            skip: (args.page - 1) * args.limit,
            take: args.limit,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
        });
        return {
            rows: result.rows,
            total: result.total,
            page: args.page,
            limit: args.limit,
        };
    }
}

export { TemplatesService };
