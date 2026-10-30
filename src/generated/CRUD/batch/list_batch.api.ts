import { Controller, Injectable, Query, Req } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { Batch } from '@entities/batch.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
    AccessPolicyFilterService,
    requireRequestUser,
    type AccessPolicyRequest,
    applyAccessFilter,
} from '@vyapti/access-policy';
import { ILike, In, IsNull } from 'typeorm';
import {
    buildAllowedOrder,
    normalizeSearch,
    resolvePagination,
} from '@vulcan/shared/utils/list-query';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const ListBatchQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['batch_id', 'batch_name']).default('batch_id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
    district_id: z.coerce.number().int().positive().optional(),
    organisation_id: z.coerce.number().int().positive().optional(),
});

export class ListBatchQueryDto extends createZodDto(ListBatchQuerySchema) {}

const LIST_BATCH_SORT_COLUMNS = {
    batch_id: 'batch_id',
    batch_name: 'batch_name',
} as const;

@Injectable()
export class ListBatchService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async list(query: ListBatchQueryDto, request: AccessPolicyRequest) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.batch_name = ILike(`%${search}%`);
        }
        if (query.district_id != null) {
            where.district_id = query.district_id;
        }
        if (query.organisation_id != null) {
            where.organisation_id = query.organisation_id;
        }
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'batch',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        const clause = applyAccessFilter(filter);
        if (clause.kind === 'empty') {
            return { items: [], total: 0, pagination };
        }
        if (clause.kind === 'in') {
            where[clause.field] = In(clause.values);
        }
        const order = buildAllowedOrder({
            columns: LIST_BATCH_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'batch_id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            Batch.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            Batch.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListBatchController {
    constructor(private readonly service: ListBatchService) {}

    @RequirePermission('batch', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/batch',
        tags: ['batch'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'batch list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listBatch(
        @Query() query: ListBatchQueryDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(
            query,
            request,
        );
        return apiSuccess(items, {
            message: 'batch list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
