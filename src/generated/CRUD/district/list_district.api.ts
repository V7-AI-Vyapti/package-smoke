import { Controller, Injectable, Query, Req } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { District } from '@entities/district.entity';
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

export const ListDistrictQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['district_id', 'name']).default('district_id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
    state_id: z.coerce.number().int().positive().optional(),
});

export class ListDistrictQueryDto extends createZodDto(
    ListDistrictQuerySchema,
) {}

const LIST_DISTRICT_SORT_COLUMNS = {
    district_id: 'district_id',
    name: 'name',
} as const;

@Injectable()
export class ListDistrictService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async list(query: ListDistrictQueryDto, request: AccessPolicyRequest) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.name = ILike(`%${search}%`);
        }
        if (query.state_id != null) {
            where.state_id = query.state_id;
        }
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'district',
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
            columns: LIST_DISTRICT_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'district_id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            District.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            District.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListDistrictController {
    constructor(private readonly service: ListDistrictService) {}

    @RequirePermission('district', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/district',
        tags: ['district'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'district list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listDistrict(
        @Query() query: ListDistrictQueryDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(
            query,
            request,
        );
        return apiSuccess(items, {
            message: 'district list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
