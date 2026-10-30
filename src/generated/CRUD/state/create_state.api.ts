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
import { State } from '@entities/state.entity';
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

export const CreateStateRequestSchema = z.object({
    name: z.string(),
});

export class CreateStateRequestDto extends createZodDto(
    CreateStateRequestSchema.partial(),
) {}

@Injectable()
export class CreateStateService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async create(body: CreateStateRequestDto, request: AccessPolicyRequest) {
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'state',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        const scoped = prepareCreateBody({ filter, body });
        const parsed = CreateStateRequestSchema.safeParse(scoped);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.issues[0].message);
        }
        return await State.createOne(parsed.data);
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
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body, request);
        return apiSuccess(data, {
            message: 'state created',
        });
    }
}
