import {
    Body,
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
import { Worker } from '@entities/worker.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateWorkerRequestSchema = z
    .object({
        full_name: z.string(),
        organisation_id: z.number().int().positive(),
        district_id: z.number().int().positive(),
    })
    .partial();

export class UpdateWorkerRequestDto extends createZodDto(
    UpdateWorkerRequestSchema,
) {}

export const WorkerIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class WorkerIdParamsDto extends createZodDto(WorkerIdParamsSchema) {}

@Injectable()
export class UpdateWorkerService {
    async update(id: number, body: UpdateWorkerRequestDto) {
        const record = await Worker.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('worker not found');
        }
        const parsed = UpdateWorkerRequestSchema.parse(body);
        await Worker.updateByPk(id, parsed);
        return await Worker.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateWorkerController {
    constructor(private readonly service: UpdateWorkerService) {}

    @RequirePermission('worker', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/worker/:id',
        tags: ['worker'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'worker updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'worker not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateWorker(
        @Param() params: WorkerIdParamsDto,
        @Body() body: UpdateWorkerRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'worker updated',
        });
    }
}
