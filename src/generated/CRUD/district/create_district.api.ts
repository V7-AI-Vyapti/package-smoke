import { Body, Controller, Injectable } from '@nestjs/common';
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

export const CreateDistrictRequestSchema = z.object({
    name: z.string(),
    state_id: z.number().int().positive(),
});

export class CreateDistrictRequestDto extends createZodDto(
    CreateDistrictRequestSchema,
) {}

@Injectable()
export class CreateDistrictService {
    async create(body: CreateDistrictRequestDto) {
        const parsed = CreateDistrictRequestSchema.parse(body);
        return await District.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateDistrictController {
    constructor(private readonly service: CreateDistrictService) {}

    @RequirePermission('district', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/district',
        tags: ['district'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'district created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createDistrict(
        @Body() body: CreateDistrictRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'district created',
        });
    }
}
