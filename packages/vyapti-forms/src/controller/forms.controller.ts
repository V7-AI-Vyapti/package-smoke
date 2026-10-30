import { Body, Controller, Param, Query, Req } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    buildPaginationMeta,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { FORMS_ROUTE_PATHS } from '../forms.config.js';
import {
    API_METHOD_TYPES,
    FORM_ACTIONS,
    FORM_RESOURCES,
    FORMS_MESSAGES,
    FORMS_TAGS,
    HTTP_STATUS_CODES,
} from '../forms.constants.js';
import { RequireFormWrite } from '../guards/require-form-write.decorator.js';
import {
    FieldParamsDto,
    FormKeyParamsDto,
    StepParamsDto,
} from '../schema/form-params.schema.js';
import {
    CreateFormRequestDto,
    SaveFormStructureRequestDto,
    UpsertFieldRequestDto,
    UpsertStepRequestDto,
} from '../schema/form.schema.js';
import { ListFormsQueryDto } from '../schema/list-forms-query.schema.js';
import {
    serializeForm,
    serializeForms,
    type FormResponse,
} from '../serializers/form.serializer.js';
import { FormsService } from '../services/forms.service.js';
import type { FormsRequest } from '../types/forms.types.js';

@Controller()
class FormsController {
    constructor(private readonly forms: FormsService) {}

    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: FORMS_ROUTE_PATHS.ROOT,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FORMS_FETCHED,
            [HTTP_STATUS_CODES.UNAUTHORIZED]: FORMS_MESSAGES.UNAUTHORIZED,
        },
    })
    async list(
        @Query() query: ListFormsQueryDto,
    ): Promise<ApiSuccessResponse<FormResponse[]>> {
        const result = await this.forms.list({
            page: query.page,
            limit: query.limit,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return apiSuccess(serializeForms(result.rows), {
            message: FORMS_MESSAGES.FORMS_FETCHED,
            meta: buildPaginationMeta(result.page, result.limit, result.total),
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.CREATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.ROOT,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.CREATED]: FORMS_MESSAGES.FORM_CREATED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.VALUE_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.ACCESS_DENIED,
            [HTTP_STATUS_CODES.CONFLICT]: FORMS_MESSAGES.DUPLICATE_KEY,
        },
    })
    async create(
        @Req() request: FormsRequest,
        @Body() payload: CreateFormRequestDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.create({ request, payload });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FORM_CREATED,
        });
    }

    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: FORMS_ROUTE_PATHS.BY_KEY,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FORM_FETCHED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.FORM_NOT_FOUND,
        },
    })
    async get(
        @Param() params: FormKeyParamsDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.get({ key: params.key });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FORM_FETCHED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.BY_KEY,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FORM_SAVED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.LAST_STEP,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.FORM_NOT_FOUND,
            [HTTP_STATUS_CODES.CONFLICT]: FORMS_MESSAGES.DUPLICATE_KEY,
        },
    })
    async save(
        @Req() request: FormsRequest,
        @Param() params: FormKeyParamsDto,
        @Body() payload: SaveFormStructureRequestDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.save({
            request,
            key: params.key,
            payload,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FORM_SAVED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.PUBLISH)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.PUBLISH,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FORM_PUBLISHED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.LOCATION_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.ACCESS_DENIED,
        },
    })
    async publish(
        @Req() request: FormsRequest,
        @Param() params: FormKeyParamsDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.publish({
            request,
            key: params.key,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FORM_PUBLISHED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.FIELDS,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FIELD_SAVED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.VALUE_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.FORM_NOT_FOUND,
            [HTTP_STATUS_CODES.CONFLICT]: FORMS_MESSAGES.DUPLICATE_KEY,
        },
    })
    async saveField(
        @Req() request: FormsRequest,
        @Param() params: FormKeyParamsDto,
        @Body() payload: UpsertFieldRequestDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.upsertField({
            request,
            key: params.key,
            payload,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FIELD_SAVED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.FIELD_REMOVE,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.FIELD_REMOVED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.FIELD_NOT_FOUND,
        },
    })
    async deleteField(
        @Req() request: FormsRequest,
        @Param() params: FieldParamsDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.removeField({
            request,
            key: params.key,
            fieldKey: params.fieldKey,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.FIELD_REMOVED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.STEPS,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.STEP_SAVED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.VALUE_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.STEP_NOT_FOUND,
            [HTTP_STATUS_CODES.CONFLICT]: FORMS_MESSAGES.DUPLICATE_KEY,
        },
    })
    async saveStep(
        @Req() request: FormsRequest,
        @Param() params: FormKeyParamsDto,
        @Body() payload: UpsertStepRequestDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.upsertStep({
            request,
            key: params.key,
            payload,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.STEP_SAVED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.STEP_REMOVE,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.STEP_REMOVED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.LAST_STEP,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.STEP_NOT_FOUND,
        },
    })
    async deleteStep(
        @Req() request: FormsRequest,
        @Param() params: StepParamsDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.forms.removeStep({
            request,
            key: params.key,
            stepId: params.stepId,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.STEP_REMOVED,
        });
    }
}

export { FormsController };
