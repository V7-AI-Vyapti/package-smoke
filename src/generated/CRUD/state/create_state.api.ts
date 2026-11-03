import { Body, Controller, Injectable } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { State } from '@entities/state.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateStateRequestSchema = z.object({
    name: z.string(),
});

export class CreateStateRequestDto extends createZodDto(
    CreateStateRequestSchema,
) {}

@Injectable()
export class CreateStateService {
    async create(body: CreateStateRequestDto) {
        const parsed = CreateStateRequestSchema.parse(body);
        return await State.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateStateController {
    constructor(private readonly service: CreateStateService) {}

    @RequirePermission('state', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/state',
        tags: ['state'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'state created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createState(
        @Body() body: CreateStateRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'state created',
        });
    }
}
