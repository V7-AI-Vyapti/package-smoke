import {
    BadRequestException,
    Body,
    Controller,
    Injectable,
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
    prepareCreateBody,
} from '@vyapti/access-policy';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateBatchRequestSchema = z.object({
    batch_name: z.string(),
    status: z.string(),
    district_id: z.number().int().positive(),
    organisation_id: z.number().int().positive(),
});

export class CreateBatchRequestDto extends createZodDto(
    CreateBatchRequestSchema.partial(),
) {}

@Injectable()
export class CreateBatchService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async create(body: CreateBatchRequestDto, request: AccessPolicyRequest) {
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'batch',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        const scoped = prepareCreateBody({ filter, body });
        const parsed = CreateBatchRequestSchema.safeParse(scoped);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.issues[0].message);
        }
        return await Batch.createOne(parsed.data);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateBatchController {
    constructor(private readonly service: CreateBatchService) {}

    @RequirePermission('batch', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/batch',
        tags: ['batch'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'batch created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createBatch(
        @Body() body: CreateBatchRequestDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body, request);
        return apiSuccess(data, {
            message: 'batch created',
        });
    }
}
