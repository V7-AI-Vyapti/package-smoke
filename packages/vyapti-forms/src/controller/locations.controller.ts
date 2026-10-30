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
import { LocationIdParamsDto } from '../schema/form-params.schema.js';
import { ListLocationsQueryDto } from '../schema/list-locations-query.schema.js';
import {
    BindLocationRequestDto,
    CreateLocationRequestDto,
} from '../schema/location.schema.js';
import {
    serializeForm,
    type FormResponse,
} from '../serializers/form.serializer.js';
import {
    serializeLocation,
    serializeLocations,
    type LocationResponse,
} from '../serializers/location.serializer.js';
import { LocationsService } from '../services/locations.service.js';
import type { FormsRequest } from '../types/forms.types.js';

@Controller()
class LocationsController {
    constructor(private readonly locations: LocationsService) {}

    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: FORMS_ROUTE_PATHS.LOCATIONS,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.LOCATIONS_FETCHED,
            [HTTP_STATUS_CODES.UNAUTHORIZED]: FORMS_MESSAGES.UNAUTHORIZED,
        },
    })
    async list(
        @Query() query: ListLocationsQueryDto,
    ): Promise<ApiSuccessResponse<LocationResponse[]>> {
        const result = await this.locations.list({
            page: query.page,
            limit: query.limit,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return apiSuccess(serializeLocations(result.rows), {
            message: FORMS_MESSAGES.LOCATIONS_FETCHED,
            meta: buildPaginationMeta(result.page, result.limit, result.total),
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM_LOCATION, FORM_ACTIONS.CREATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.LOCATIONS,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.CREATED]: FORMS_MESSAGES.LOCATION_CREATED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.VALUE_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.ACCESS_DENIED,
            [HTTP_STATUS_CODES.CONFLICT]: FORMS_MESSAGES.DUPLICATE_KEY,
        },
    })
    async create(
        @Req() request: FormsRequest,
        @Body() payload: CreateLocationRequestDto,
    ): Promise<ApiSuccessResponse<LocationResponse>> {
        const location = await this.locations.create({ request, payload });
        return apiSuccess(serializeLocation(location), {
            message: FORMS_MESSAGES.LOCATION_CREATED,
        });
    }

    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: FORMS_ROUTE_PATHS.LOCATION_BY_ID,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.LOCATION_FETCHED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.NOT_PUBLISHED,
        },
    })
    async getPublished(
        @Param() params: LocationIdParamsDto,
    ): Promise<ApiSuccessResponse<FormResponse>> {
        const form = await this.locations.getPublished({
            locationId: params.id,
        });
        return apiSuccess(serializeForm(form), {
            message: FORMS_MESSAGES.LOCATION_FETCHED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM_LOCATION, FORM_ACTIONS.UPDATE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.LOCATION_BY_ID,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.LOCATION_UPDATED,
            [HTTP_STATUS_CODES.BAD_REQUEST]: FORMS_MESSAGES.VALUE_REQUIRED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.LOCATION_NOT_FOUND,
        },
    })
    async bind(
        @Req() request: FormsRequest,
        @Param() params: LocationIdParamsDto,
        @Body() payload: BindLocationRequestDto,
    ): Promise<ApiSuccessResponse<LocationResponse>> {
        const location = await this.locations.bind({
            request,
            locationId: params.id,
            formKey: payload.formKey,
        });
        return apiSuccess(serializeLocation(location), {
            message: FORMS_MESSAGES.LOCATION_UPDATED,
        });
    }

    @RequireFormWrite(FORM_RESOURCES.FORM_LOCATION, FORM_ACTIONS.DELETE)
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: FORMS_ROUTE_PATHS.LOCATION_REMOVE,
        tags: FORMS_TAGS,
        responses: {
            [HTTP_STATUS_CODES.OK]: FORMS_MESSAGES.LOCATION_REMOVED,
            [HTTP_STATUS_CODES.NOT_FOUND]: FORMS_MESSAGES.LOCATION_NOT_FOUND,
        },
    })
    async remove(
        @Req() request: FormsRequest,
        @Param() params: LocationIdParamsDto,
    ): Promise<ApiSuccessResponse<{ locationId: string }>> {
        const removed = await this.locations.remove({
            request,
            locationId: params.id,
        });
        return apiSuccess(removed, {
            message: FORMS_MESSAGES.LOCATION_REMOVED,
        });
    }
}

export { LocationsController };
