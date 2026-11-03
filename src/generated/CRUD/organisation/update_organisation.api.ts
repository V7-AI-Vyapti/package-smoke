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
import { Organisation } from '@entities/organisation.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateOrganisationRequestSchema = z
    .object({
        status: z.string(),
        organisation_type: z.string(),
        legal_name: z.string(),
    })
    .partial();

export class UpdateOrganisationRequestDto extends createZodDto(
    UpdateOrganisationRequestSchema,
) {}

export const OrganisationIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class OrganisationIdParamsDto extends createZodDto(
    OrganisationIdParamsSchema,
) {}

@Injectable()
export class UpdateOrganisationService {
    async update(id: number, body: UpdateOrganisationRequestDto) {
        const record = await Organisation.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('organisation not found');
        }
        const parsed = UpdateOrganisationRequestSchema.parse(body);
        await Organisation.updateByPk(id, parsed);
        return await Organisation.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateOrganisationController {
    constructor(private readonly service: UpdateOrganisationService) {}

    @RequirePermission('organisation', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/organisation/:id',
        tags: ['organisation'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'organisation updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'organisation not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateOrganisation(
        @Param() params: OrganisationIdParamsDto,
        @Body() body: UpdateOrganisationRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'organisation updated',
        });
    }
}
