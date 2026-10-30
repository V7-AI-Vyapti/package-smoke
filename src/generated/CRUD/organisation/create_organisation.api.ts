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
import { Organisation } from '@entities/organisation.entity';
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

export const CreateOrganisationRequestSchema = z.object({
    status: z.string(),
    organisation_type: z.string(),
    legal_name: z.string(),
});

export class CreateOrganisationRequestDto extends createZodDto(
    CreateOrganisationRequestSchema.partial(),
) {}

@Injectable()
export class CreateOrganisationService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async create(
        body: CreateOrganisationRequestDto,
        request: AccessPolicyRequest,
    ) {
        const user = requireRequestUser(request);
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'organisation',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        const scoped = prepareCreateBody({ filter, body });
        const parsed = CreateOrganisationRequestSchema.safeParse(scoped);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.issues[0].message);
        }
        return await Organisation.createOne(parsed.data);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateOrganisationController {
    constructor(private readonly service: CreateOrganisationService) {}

    @RequirePermission('organisation', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/organisation',
        tags: ['organisation'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'organisation created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createOrganisation(
        @Body() body: CreateOrganisationRequestDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body, request);
        return apiSuccess(data, {
            message: 'organisation created',
        });
    }
}
