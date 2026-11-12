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
import { State } from '@entities/state.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const StateIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class StateIdParamsDto extends createZodDto(StateIdParamsSchema) {}

@Injectable()
export class ViewStateService {
    async getById(id: number) {
        const record = await State.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('state not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewStateController {
    constructor(private readonly service: ViewStateService) {}

    @RequirePermission('state', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/state/:id',
        tags: ['state'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'state fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'state not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getState(
        @Param() params: StateIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'state fetched',
        });
    }
}
