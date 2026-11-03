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
import { Organisation } from '@entities/organisation.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const OrganisationIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class OrganisationIdParamsDto extends createZodDto(
    OrganisationIdParamsSchema,
) {}

@Injectable()
export class ViewOrganisationService {
    async getById(id: number) {
        const record = await Organisation.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('organisation not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewOrganisationController {
    constructor(private readonly service: ViewOrganisationService) {}

    @RequirePermission('organisation', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/organisation/:id',
        tags: ['organisation'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'organisation fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'organisation not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getOrganisation(
        @Param() params: OrganisationIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'organisation fetched',
        });
    }
}
