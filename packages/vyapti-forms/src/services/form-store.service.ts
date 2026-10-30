import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    FORM_ENTITY,
    FORM_STATUS,
    FORMS_ERROR_CODES,
    FORMS_MESSAGES,
} from '../forms.constants.js';
import { FORMS_MODULE_OPTIONS, FORMS_PERSISTENCE_ADAPTER } from '../forms.tokens.js';
import type { ResolvedFormsModuleOptions } from '../types/module.types.js';
import type { FormsPersistenceAdapter } from '../types/persistence.types.js';
import type {
    FormEvent,
    FormEventName,
    FormRecord,
    FormStructureChange,
    FormView,
    LocationRecord,
    LocationView,
} from '../types/forms.types.js';
import { assembleFormView, readStructure } from '../utils/assemble-form-view.util.js';
import { throwFormError } from '../utils/throw-form-error.util.js';

@Injectable()
class FormStore {
    private readonly logger = new Logger(FormStore.name);

    constructor(
        @Inject(FORMS_PERSISTENCE_ADAPTER)
        private readonly persistence: FormsPersistenceAdapter,
        @Inject(FORMS_MODULE_OPTIONS)
        private readonly options: ResolvedFormsModuleOptions,
    ) {}

    async fetchFormOrThrow(args: { key: string }): Promise<FormRecord> {
        const form = await this.persistence.findForm({ key: args.key });
        if (!form) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.FORM_NOT_FOUND,
            });
        }
        return form;
    }

    async fetchLocationOrThrow(args: { locationId: string }): Promise<LocationRecord> {
        const location = await this.persistence.findLocation({
            locationId: args.locationId,
        });
        if (!location) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.LOCATION_NOT_FOUND,
            });
        }
        return location;
    }

    locationIds(args: { formKey: string }): Promise<string[]> {
        return this.persistence.listLocationIds({ formKey: args.formKey });
    }

    async demoteIfUnbound(args: {
        formKey: string | null;
        actorUserId: string;
    }): Promise<void> {
        if (!args.formKey) {
            return;
        }
        const form = await this.persistence.findForm({ key: args.formKey });
        if (!form || form.status !== FORM_STATUS.PUBLISHED) {
            return;
        }
        const locationIds = await this.locationIds({ formKey: args.formKey });
        if (locationIds.length > 0) {
            return;
        }
        await this.persistence.markFormDraft({
            key: args.formKey,
            updatedBy: args.actorUserId,
        });
    }

    async emit(event: FormEvent): Promise<void> {
        const hook = this.options.onFormEvent;
        if (!hook) {
            return;
        }
        try {
            await hook(event);
        } catch (error) {
            this.logger.error(
                `form event failed event=${event.event} formKey=${event.formKey ?? ''} locationId=${event.locationId ?? ''}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async saveStructure(args: {
        key: string;
        actorUserId: string;
        event: FormEventName;
        change: FormStructureChange;
    }): Promise<FormView> {
        const current = await this.fetchFormOrThrow({ key: args.key });
        const structure = args.change(readStructure(current));
        const saved = await this.persistence.replaceFormStructure({
            key: current.key,
            structure,
            version: current.version + 1,
            updatedBy: args.actorUserId,
        });
        if (!saved) {
            throwFormError({
                status: 'not_found',
                code: FORMS_ERROR_CODES.NOT_FOUND,
                message: FORMS_MESSAGES.FORM_NOT_FOUND,
            });
        }
        await this.emit({
            event: args.event,
            entityType: FORM_ENTITY.FORM,
            formKey: current.key,
            actorUserId: args.actorUserId,
        });
        const locationIds = await this.locationIds({ formKey: current.key });
        return assembleFormView({ form: saved, locationIds });
    }

    async buildLocationView(location: LocationRecord): Promise<LocationView> {
        if (!location.formKey) {
            return { ...location, form: null };
        }
        const form = await this.persistence.findForm({ key: location.formKey });
        if (!form) {
            return { ...location, form: null };
        }
        return {
            ...location,
            form: {
                key: form.key,
                title: form.title,
                status: form.status,
                version: form.version,
                kind: form.kind,
            },
        };
    }
}

export { FormStore };
