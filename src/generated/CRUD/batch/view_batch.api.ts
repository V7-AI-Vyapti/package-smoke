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
import { Batch } from '@entities/batch.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const BatchIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class BatchIdParamsDto extends createZodDto(BatchIdParamsSchema) {}

@Injectable()
export class ViewBatchService {
    async getById(id: number) {
        const record = await Batch.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('batch not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewBatchController {
    constructor(private readonly service: ViewBatchService) {}

    @RequirePermission('batch', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/batch/:id',
        tags: ['batch'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'batch fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'batch not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getBatch(
        @Param() params: BatchIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'batch fetched',
        });
    }
}
