import { Body, Controller, Injectable } from '@nestjs/common';
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
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateOrganisationRequestSchema = z.object({
    status: z.string(),
    organisation_type: z.string(),
    legal_name: z.string(),
});

export class CreateOrganisationRequestDto extends createZodDto(
    CreateOrganisationRequestSchema,
) {}

@Injectable()
export class CreateOrganisationService {
    async create(body: CreateOrganisationRequestDto) {
        const parsed = CreateOrganisationRequestSchema.parse(body);
        return await Organisation.createOne(parsed);
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
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'organisation created',
        });
    }
}
