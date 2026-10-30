import { Inject, Injectable } from '@nestjs/common';
import {
    FORM_ENTITY,
    FORM_EVENTS,
    FORM_STATUS,
    FORMS_ERROR_CODES,
    FORMS_MESSAGES,
} from '../forms.constants.js';
import { FORMS_PERSISTENCE_ADAPTER } from '../forms.tokens.js';
import type { CreateLocationRequestDto } from '../schema/location.schema.js';
import type {
    FormEventName,
    FormView,
    FormsRequest,
    LocationView,
} from '../types/forms.types.js';
import type {
    FormsPersistenceAdapter,
    LocationListArgs,
} from '../types/persistence.types.js';
import { assembleFormView } from '../utils/assemble-form-view.util.js';
import {
    assertLocationId,
    resolveOptionalFormKey,
} from '../utils/assert-identifier.util.js';
import { assertHint, assertLabel } from '../utils/assert-text.util.js';
import { normalizeSearch } from '../utils/normalize-search.util.js';
import { readSessionUser } from '../utils/read-session-user.util.js';
import { throwFormError } from '../utils/throw-form-error.util.js';
import { FormStore } from './form-store.service.js';

type ListLocationsArgs = {
    page: number;
    limit: number;
    search?: string | null;
    sortBy: LocationListArgs['sortBy'];
    sortOrder: LocationListArgs['sortOrder'];
};

@Injectable()
class LocationsService {
    constructor(
        @Inject(FORMS_PERSISTENCE_ADAPTER)
        private readonly persistence: FormsPersistenceAdapter,
        private readonly store: FormStore,
    ) {}

    async list(args: ListLocationsArgs): Promise<{
        rows: LocationView[];
        total: number;
        page: number;
        limit: number;
    }> {
        const result = await this.persistence.listLocations({
            search: normalizeSearch(args.search),
            skip: (args.page - 1) * args.limit,
            take: args.limit,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
        });
        const rows: LocationView[] = [];
        for (const location of result.rows) {
            rows.push(await this.store.buildLocationView(location));
        }
        return { rows, total: result.total, page: args.page, limit: args.limit };
    }

    async getPublished(args: { locationId: string }): Promise<FormView> {
        const locationId = assertLocationId(args.locationId);
        const location = await this.store.fetchLocationOrThrow({ locationId });
        if (!location.formKey) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.LOCATION_UNBOUND,
            });
        }
        const form = await this.store.fetchFormOrThrow({ key: location.formKey });
        if (form.status !== FORM_STATUS.PUBLISHED) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_PUBLISHED,
                message: FORMS_MESSAGES.NOT_PUBLISHED,
            });
        }
        const locationIds = await this.store.locationIds({ formKey: form.key });
        return assembleFormView({ form, locationIds });
    }

    async create(args: {
        request: FormsRequest;
        payload: CreateLocationRequestDto;
    }): Promise<LocationView> {
        const actorUserId = readSessionUser(args.request).id;
        const locationId = assertLocationId(args.payload.locationId);
        const existing = await this.persistence.findLocation({ locationId });
        if (existing) {
            throwFormError({
                status: 'conflict',
                code: FORMS_ERROR_CODES.DUPLICATE_KEY,
                message: FORMS_MESSAGES.DUPLICATE_KEY,
            });
        }
        const created = await this.persistence.createLocation({
            input: {
                locationId,
                label: assertLabel(args.payload.label),
                hint: assertHint(args.payload.hint),
                updatedBy: actorUserId,
            },
        });
        await this.store.emit({
            event: FORM_EVENTS.LOCATION_CREATED,
            entityType: FORM_ENTITY.FORM_LOCATION,
            locationId,
            actorUserId,
        });
        return this.store.buildLocationView(created);
    }

    async bind(args: {
        request: FormsRequest;
        locationId: string;
        formKey: string | null | undefined;
    }): Promise<LocationView> {
        const actorUserId = readSessionUser(args.request).id;
        const locationId = assertLocationId(args.locationId);
        if (args.formKey === undefined) {
            throwFormError({
                status: 'bad_request',
                code: FORMS_ERROR_CODES.VALUE_REQUIRED,
                message: FORMS_MESSAGES.FORM_KEY_REQUIRED,
            });
        }
        const nextFormKey = resolveOptionalFormKey(args.formKey);
        const location = await this.store.fetchLocationOrThrow({ locationId });
        if (nextFormKey) {
            await this.store.fetchFormOrThrow({ key: nextFormKey });
        }
        const saved = await this.persistence.bindLocation({
            locationId,
            formKey: nextFormKey,
            updatedBy: actorUserId,
        });
        if (!saved) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.LOCATION_NOT_FOUND,
            });
        }
        await this.store.demoteIfUnbound({
            formKey: location.formKey,
            actorUserId,
        });
        await this.store.emit({
            event: bindEvent({
                previousFormKey: location.formKey,
                nextFormKey,
            }),
            entityType: FORM_ENTITY.FORM_LOCATION,
            locationId,
            formKey: nextFormKey ?? location.formKey ?? undefined,
            actorUserId,
        });
        return this.store.buildLocationView(saved);
    }

    async remove(args: {
        request: FormsRequest;
        locationId: string;
    }): Promise<{ locationId: string }> {
        const actorUserId = readSessionUser(args.request).id;
        const locationId = assertLocationId(args.locationId);
        const location = await this.store.fetchLocationOrThrow({ locationId });
        const removed = await this.persistence.deleteLocation({ locationId });
        if (!removed) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.LOCATION_NOT_FOUND,
            });
        }
        await this.store.demoteIfUnbound({
            formKey: location.formKey,
            actorUserId,
        });
        await this.store.emit({
            event: FORM_EVENTS.LOCATION_REMOVED,
            entityType: FORM_ENTITY.FORM_LOCATION,
            locationId,
            formKey: location.formKey ?? undefined,
            actorUserId,
        });
        return { locationId };
    }
}

function bindEvent(args: {
    previousFormKey: string | null;
    nextFormKey: string | null;
}): FormEventName {
    if (args.nextFormKey && args.nextFormKey !== args.previousFormKey) {
        return FORM_EVENTS.LOCATION_BOUND;
    }
    return FORM_EVENTS.LOCATION_UPDATED;
}

export { LocationsService };
