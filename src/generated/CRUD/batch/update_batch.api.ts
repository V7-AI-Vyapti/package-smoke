import {
    Body,
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
    assertUpdateScope,
} from '@vyapti/access-policy';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateBatchRequestSchema = z
    .object({
        batch_name: z.string(),
        status: z.string(),
        district_id: z.number().int().positive(),
        organisation_id: z.number().int().positive(),
    })
    .partial();

export class UpdateBatchRequestDto extends createZodDto(
    UpdateBatchRequestSchema,
) {}

export const BatchIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class BatchIdParamsDto extends createZodDto(BatchIdParamsSchema) {}

@Injectable()
export class UpdateBatchService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async update(
        id: number,
        body: UpdateBatchRequestDto,
        request: AccessPolicyRequest,
    ) {
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
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'batch',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        assertUpdateScope({ filter, body });
        const parsed = UpdateBatchRequestSchema.parse(body);
        await Batch.updateByPk(id, parsed);
        return await Batch.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateBatchController {
    constructor(private readonly service: UpdateBatchService) {}

    @RequirePermission('batch', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/batch/:id',
        tags: ['batch'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'batch updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'batch not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateBatch(
        @Param() params: BatchIdParamsDto,
        @Body() body: UpdateBatchRequestDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body, request);
        return apiSuccess(data, {
            message: 'batch updated',
        });
    }
}
