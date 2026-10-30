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
import { State } from '@entities/state.entity';
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

export const StateIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class StateIdParamsDto extends createZodDto(StateIdParamsSchema) {}

@Injectable()
export class DeleteStateService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}

    async remove(id: number, request: AccessPolicyRequest) {
        const record = await State.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('state not found');
        }
        const user = requireRequestUser(request);
        try {
            await this.accessPolicy.assertRow({
                userId: user.id,
                entityName: 'state',
                isSystemAdmin: user.isSystemAdmin === true,
                row: record,
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('state not found');
            }
            throw error;
        }
        await State.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteStateController {
    constructor(private readonly service: DeleteStateService) {}

    @RequirePermission('state', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/state/:id',
        tags: ['state'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'state deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'state not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteState(
        @Param() params: StateIdParamsDto,
        @Req() request: AccessPolicyRequest,
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const data = await this.service.remove(params.id, request);
        return apiSuccess(data, {
            message: 'state deleted',
        });
    }
}
