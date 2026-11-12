import {
    Controller,
    Injectable,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { District } from '@entities/district.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const DistrictIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class DistrictIdParamsDto extends createZodDto(DistrictIdParamsSchema) {}

@Injectable()
export class ViewDistrictService {
    async getById(id: number) {
        const record = await District.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('district not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewDistrictController {
    constructor(private readonly service: ViewDistrictService) {}

    @RequirePermission('district', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/district/:id',
        tags: ['district'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'district fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'district not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getDistrict(
        @Param() params: DistrictIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'district fetched',
        });
    }
}
