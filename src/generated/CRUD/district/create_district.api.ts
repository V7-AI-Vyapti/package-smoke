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
import { District } from '@entities/district.entity';
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

export const CreateDistrictRequestSchema = z.object({
    name: z.string(),
    state_id: z.number().int().positive(),
});

export class CreateDistrictRequestDto extends createZodDto(
    CreateDistrictRequestSchema.partial(),
) {}

@Injectable()
export class CreateDistrictService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async create(body: CreateDistrictRequestDto, request: AccessPolicyRequest) {
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'district',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        const scoped = prepareCreateBody({ filter, body });
        const parsed = CreateDistrictRequestSchema.safeParse(scoped);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.issues[0].message);
        }
        return await District.createOne(parsed.data);
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
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body, request);
        return apiSuccess(data, {
            message: 'district created',
        });
    }
}
