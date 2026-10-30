import { Inject, Injectable } from '@nestjs/common';
import {
    FORM_ENTITY,
    FORM_EVENTS,
    FORM_STATUS,
    FORMS_DEFAULTS,
    FORMS_ERROR_CODES,
    FORMS_MESSAGES,
} from '../forms.constants.js';
import { FORMS_PERSISTENCE_ADAPTER } from '../forms.tokens.js';
import type {
    CreateFormRequestDto,
    SaveFormStructureRequestDto,
    UpsertFieldRequestDto,
    UpsertStepRequestDto,
} from '../schema/form.schema.js';
import type {
    FormStructure,
    FormStructureChange,
    FormView,
    FormsRequest,
} from '../types/forms.types.js';
import type {
    FormListArgs,
    FormsPersistenceAdapter,
} from '../types/persistence.types.js';
import { assembleFormView } from '../utils/assemble-form-view.util.js';
import { assertBrandImage } from '../utils/assert-brand-image.util.js';
import {
    assertFormKey,
    assertKeyShape,
    assertLocationId,
} from '../utils/assert-identifier.util.js';
import { assertDescription, assertTitle } from '../utils/assert-text.util.js';
import {
    acceptStructure,
    removeField,
    removeStep,
    upsertField,
    upsertStep,
} from '../utils/form-structure.util.js';
import { initialFormStructure } from '../utils/initial-form-structure.util.js';
import { normalizeField } from '../utils/normalize-field.util.js';
import { normalizeSearch } from '../utils/normalize-search.util.js';
import {
    normalizeStep,
    normalizeStructure,
} from '../utils/normalize-structure.util.js';
import { readSessionUser } from '../utils/read-session-user.util.js';
import { throwFormError } from '../utils/throw-form-error.util.js';
import { FormStore } from './form-store.service.js';
import { LocationsService } from './locations.service.js';

type ListFormsArgs = {
    page: number;
    limit: number;
    search?: string | null;
    sortBy: FormListArgs['sortBy'];
    sortOrder: FormListArgs['sortOrder'];
};

@Injectable()
class FormsService {
    constructor(
        @Inject(FORMS_PERSISTENCE_ADAPTER)
        private readonly persistence: FormsPersistenceAdapter,
        private readonly store: FormStore,
        private readonly locations: LocationsService,
    ) {}

    async list(args: ListFormsArgs): Promise<{
        rows: FormView[];
        total: number;
        page: number;
        limit: number;
    }> {
        const result = await this.persistence.listForms({
            search: normalizeSearch(args.search),
            skip: (args.page - 1) * args.limit,
            take: args.limit,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
        });
        const rows: FormView[] = [];
        for (const form of result.rows) {
            const locationIds = await this.store.locationIds({
                formKey: form.key,
            });
            rows.push(assembleFormView({ form, locationIds }));
        }
        return {
            rows,
            total: result.total,
            page: args.page,
            limit: args.limit,
        };
    }

    async get(args: { key: string }): Promise<FormView> {
        const key = assertFormKey(args.key);
        const form = await this.store.fetchFormOrThrow({ key });
        const locationIds = await this.store.locationIds({ formKey: key });
        return assembleFormView({ form, locationIds });
    }

    async create(args: {
        request: FormsRequest;
        payload: CreateFormRequestDto;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.payload.key);
        const locationId = readOptionalLocationId(args.payload.locationId);
        await this.assertKeyIsFree(key);
        if (locationId) {
            await this.store.fetchLocationOrThrow({ locationId });
        }

        const structure = initialFormStructure();
        const created = await this.persistence.createForm({
            input: {
                key,
                title: assertTitle(args.payload.title),
                description: assertDescription(args.payload.description),
                brandImage: assertBrandImage(args.payload.brandImage),
                brandDetailRequired:
                    args.payload.brandDetailRequired ??
                    FORMS_DEFAULTS.BRAND_DETAIL_REQUIRED,
                kind: args.payload.kind ?? FORMS_DEFAULTS.KIND,
                status: FORM_STATUS.DRAFT,
                version: FORMS_DEFAULTS.VERSION,
                steps: structure.steps,
                sections: structure.sections,
                fields: structure.fields,
                updatedBy: actorUserId,
            },
        });
        await this.store.emit({
            event: FORM_EVENTS.CREATED,
            entityType: FORM_ENTITY.FORM,
            formKey: created.key,
            actorUserId,
        });
        if (locationId) {
            await this.locations.bind({
                request: args.request,
                locationId,
                formKey: created.key,
            });
        }
        const locationIds = await this.store.locationIds({
            formKey: created.key,
        });
        return assembleFormView({ form: created, locationIds });
    }

    save(args: {
        request: FormsRequest;
        key: string;
        payload: SaveFormStructureRequestDto;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const structure = acceptStructure(
            normalizeStructure({
                steps: args.payload.steps,
                sections: args.payload.sections,
                fields: args.payload.fields,
            }),
        );
        return this.store.saveStructure({
            key,
            actorUserId,
            event: FORM_EVENTS.SAVED,
            change: replaceWith(structure),
        });
    }

    async publish(args: {
        request: FormsRequest;
        key: string;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const form = await this.store.fetchFormOrThrow({ key });
        const locationIds = await this.store.locationIds({ formKey: key });
        if (locationIds.length === 0) {
            throwFormError({
                status: 'bad_request',
                code: FORMS_ERROR_CODES.LOCATION_REQUIRED,
                message: FORMS_MESSAGES.LOCATION_REQUIRED,
            });
        }
        const published = await this.persistence.publishForm({
            key,
            version: form.version + 1,
            updatedBy: actorUserId,
        });
        if (!published) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.FORM_NOT_FOUND,
            });
        }
        await this.store.emit({
            event: FORM_EVENTS.PUBLISHED,
            entityType: FORM_ENTITY.FORM,
            formKey: key,
            actorUserId,
        });
        return assembleFormView({ form: published, locationIds });
    }

    upsertField(args: {
        request: FormsRequest;
        key: string;
        payload: UpsertFieldRequestDto;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const normalized = normalizeField(args.payload);
        return this.store.saveStructure({
            key,
            actorUserId,
            event: FORM_EVENTS.FIELD_SAVED,
            change(structure: FormStructure): FormStructure {
                return upsertField({
                    structure,
                    field: normalized.field,
                    previousKey: normalized.previousKey,
                    orderProvided: normalized.orderProvided,
                });
            },
        });
    }

    removeField(args: {
        request: FormsRequest;
        key: string;
        fieldKey: string;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const fieldKey = assertKeyShape(args.fieldKey);
        return this.store.saveStructure({
            key,
            actorUserId,
            event: FORM_EVENTS.FIELD_REMOVED,
            change(structure: FormStructure): FormStructure {
                return removeField({ structure, fieldKey });
            },
        });
    }

    upsertStep(args: {
        request: FormsRequest;
        key: string;
        payload: UpsertStepRequestDto;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const normalized = normalizeStep(args.payload, 0);
        return this.store.saveStructure({
            key,
            actorUserId,
            event: FORM_EVENTS.STEP_SAVED,
            change(structure: FormStructure): FormStructure {
                return upsertStep({
                    structure,
                    step: normalized.step,
                    previousId: normalized.previousId,
                    orderProvided: normalized.orderProvided,
                });
            },
        });
    }

    removeStep(args: {
        request: FormsRequest;
        key: string;
        stepId: string;
    }): Promise<FormView> {
        const actorUserId = readSessionUser(args.request).id;
        const key = assertFormKey(args.key);
        const stepId = assertKeyShape(args.stepId);
        return this.store.saveStructure({
            key,
            actorUserId,
            event: FORM_EVENTS.STEP_REMOVED,
            change(structure: FormStructure): FormStructure {
                return removeStep({ structure, stepId });
            },
        });
    }

    private async assertKeyIsFree(key: string): Promise<void> {
        const existing = await this.persistence.findForm({ key });
        if (existing) {
            throwFormError({
                status: 'conflict',
                code: FORMS_ERROR_CODES.DUPLICATE_KEY,
                message: FORMS_MESSAGES.DUPLICATE_KEY,
            });
        }
    }
}

function readOptionalLocationId(value: string | undefined): string | null {
    if (value == null || value.trim().length === 0) {
        return null;
    }
    return assertLocationId(value);
}

function replaceWith(structure: FormStructure): FormStructureChange {
    function replaceExisting(): FormStructure {
        return structure;
    }
    return replaceExisting;
}

export { FormsService };
