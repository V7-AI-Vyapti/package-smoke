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
import { Worker } from '@entities/worker.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const WorkerIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class WorkerIdParamsDto extends createZodDto(WorkerIdParamsSchema) {}

@Injectable()
export class DeleteWorkerService {
    async remove(id: number) {
        const record = await Worker.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('worker not found');
        }
        await Worker.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteWorkerController {
    constructor(private readonly service: DeleteWorkerService) {}

    @RequirePermission('worker', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/worker/:id',
        tags: ['worker'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'worker deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'worker not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteWorker(
        @Param() params: WorkerIdParamsDto,
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const data = await this.service.remove(params.id);
        return apiSuccess(data, {
            message: 'worker deleted',
        });
    }
}
