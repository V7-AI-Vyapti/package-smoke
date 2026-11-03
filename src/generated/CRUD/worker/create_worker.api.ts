import { Body, Controller, Injectable } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Worker } from '@entities/worker.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateWorkerRequestSchema = z.object({
    full_name: z.string(),
    organisation_id: z.number().int().positive(),
    district_id: z.number().int().positive(),
});

export class CreateWorkerRequestDto extends createZodDto(
    CreateWorkerRequestSchema,
) {}

@Injectable()
export class CreateWorkerService {
    async create(body: CreateWorkerRequestDto) {
        const parsed = CreateWorkerRequestSchema.parse(body);
        return await Worker.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateWorkerController {
    constructor(private readonly service: CreateWorkerService) {}

    @RequirePermission('worker', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/worker',
        tags: ['worker'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'worker created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createWorker(
        @Body() body: CreateWorkerRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'worker created',
        });
    }
}
