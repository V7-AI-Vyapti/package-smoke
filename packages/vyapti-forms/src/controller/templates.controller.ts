import { Controller, Query } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    buildPaginationMeta,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { FORMS_ROUTE_PATHS } from '../forms.config.js';
import {
    API_METHOD_TYPES,
    FORMS_MESSAGES,
    FORMS_TAGS,
    HTTP_STATUS_CODES,
} from '../forms.constants.js';
import { ListTemplatesQueryDto } from '../schema/list-templates-query.schema.js';
import {
    serializeTemplates,
    type TemplateResponse,
} from '../serializers/template.serializer.js';
import { TemplatesService } from '../services/templates.service.js';

@Controller()
class TemplatesController {
    constructor(private readonly templates: TemplatesService) {}

    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: FORMS_ROUTE_PATHS.TEMPLATES,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.TEMPLATES_FETCHED,
            [HTTP_STATUS_CODES.UNAUTHORIZED]: FORMS_MESSAGES.UNAUTHORIZED,
        },
    })
    async list(
        @Query() query: ListTemplatesQueryDto,
    ): Promise<ApiSuccessResponse<TemplateResponse[]>> {
        const result = await this.templates.list({
            page: query.page,
            limit: query.limit,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return apiSuccess(serializeTemplates(result.rows), {
            message: FORMS_MESSAGES.TEMPLATES_FETCHED,
            meta: buildPaginationMeta(result.page, result.limit, result.total),
        });
    }
}

export { TemplatesController };
