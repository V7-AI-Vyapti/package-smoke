import {
    Controller,
    Injectable,
    NotFoundException,
    Param,
    Req,
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
import {
    AccessPolicyFilterService,
    requireRequestUser,
    type AccessPolicyRequest,
} from '@vyapti/access-policy';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const BatchIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class BatchIdParamsDto extends createZodDto(BatchIdParamsSchema) {}

@Injectable()
export class DeleteBatchService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async remove(id: number, request: AccessPolicyRequest) {
        const record = await Batch.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('batch not found');
        }
        const user = requireRequestUser(request);
        try {
            await this.accessPolicy.assertRow({
                userId: user.id,
                entityName: 'batch',
                isSystemAdmin: user.isSystemAdmin === true,
                row: record,
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('batch not found');
            }
            throw error;
        }
        await Batch.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteBatchController {
    constructor(private readonly service: DeleteBatchService) {}

    @RequirePermission('batch', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/batch/:id',
        tags: ['batch'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'batch deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'batch not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteBatch(
        @Param() params: BatchIdParamsDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const data = await this.service.remove(params.id, request);
        return apiSuccess(data, {
            message: 'batch deleted',
        });
    }
}
