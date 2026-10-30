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
import { District } from '@entities/district.entity';
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

export const UpdateDistrictRequestSchema = z
    .object({
        name: z.string(),
        state_id: z.number().int().positive(),
    })
    .partial();

export class UpdateDistrictRequestDto extends createZodDto(
    UpdateDistrictRequestSchema,
) {}

export const DistrictIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class DistrictIdParamsDto extends createZodDto(DistrictIdParamsSchema) {}

@Injectable()
export class UpdateDistrictService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async update(
        id: number,
        body: UpdateDistrictRequestDto,
        request: AccessPolicyRequest,
    ) {
        const record = await District.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('district not found');
        }
        const user = requireRequestUser(request);
        try {
            await this.accessPolicy.assertRow({
                userId: user.id,
                entityName: 'district',
                isSystemAdmin: user.isSystemAdmin === true,
                row: record,
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('district not found');
            }
            throw error;
        }
        const filter = await this.accessPolicy.resolveFilter({
            userId: user.id,
            entityName: 'district',
            isSystemAdmin: user.isSystemAdmin === true,
        });
        assertUpdateScope({ filter, body });
        const parsed = UpdateDistrictRequestSchema.parse(body);
        await District.updateByPk(id, parsed);
        return await District.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateDistrictController {
    constructor(private readonly service: UpdateDistrictService) {}

    @RequirePermission('district', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/district/:id',
        tags: ['district'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'district updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'district not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateDistrict(
        @Param() params: DistrictIdParamsDto,
        @Body() body: UpdateDistrictRequestDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body, request);
        return apiSuccess(data, {
            message: 'district updated',
        });
    }
}
