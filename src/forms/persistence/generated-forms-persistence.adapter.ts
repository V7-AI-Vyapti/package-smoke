import { ILike } from 'typeorm';
import { toIsoDateString } from '@auth/utils/iso-date.util';
import type {
    FormCreateInput,
    FormListArgs,
    FormRecord,
    FormStatus,
    FormStructure,
    FormsPersistenceAdapter,
    LocationCreateInput,
    LocationListArgs,
    LocationRecord,
    PageResult,
    TemplateListArgs,
    TemplateRecord,
} from '@vyapti/forms';
import { FormDefinition } from '../entities/form_definition.entity';
import { FormFieldTemplate } from '../entities/form_field_template.entity';
import { FormLocation } from '../entities/form_location.entity';
import {
    FORM_SORT_COLUMNS,
    LOCATION_SORT_COLUMNS,
    TEMPLATE_SORT_COLUMNS,
} from '../forms.constants';
import {
    FormDefinitionCreateSchema,
    FormDefinitionStatusUpdateSchema,
    FormDefinitionStructureUpdateSchema,
} from '../schema/form-definition-write.schema';
import {
    FormLocationBindSchema,
    FormLocationCreateSchema,
} from '../schema/form-location-write.schema';
import { mapFormRecord } from '../utils/map-form-record.util';
import { mapLocationRecord } from '../utils/map-location-record.util';
import { mapTemplateRecord } from '../utils/map-template-record.util';

class GeneratedFormsPersistenceAdapter implements FormsPersistenceAdapter {
    async listForms(args: FormListArgs): Promise<PageResult<FormRecord>> {
        const where = searchWhere({
            search: args.search,
            fields: ['form_key', 'title'],
        });
        const [rows, total] = await Promise.all([
            FormDefinition.filter(where, {
                skip: args.skip,
                take: args.take,
                order: {
                    [FORM_SORT_COLUMNS[args.sortBy]]: args.sortOrder,
                },
            }),
            FormDefinition.countOf(where),
        ]);
        return { rows: mapRows(rows, mapFormRecord), total };
    }

    async findForm(args: { key: string }): Promise<FormRecord | null> {
        const row = await FormDefinition.one({ form_key: args.key });
        return row ? mapFormRecord(row) : null;
    }

    async createForm(args: { input: FormCreateInput }): Promise<FormRecord> {
        const payload = FormDefinitionCreateSchema.parse({
            form_key: args.input.key,
            title: args.input.title,
            description: args.input.description,
            brand_image: args.input.brandImage,
            brand_detail_required: args.input.brandDetailRequired,
            kind: args.input.kind,
            status: args.input.status,
            version: args.input.version,
            steps: args.input.steps,
            sections: args.input.sections,
            fields: args.input.fields,
            updated_by: args.input.updatedBy,
            updated_at: toIsoDateString(new Date()),
        });
        const created = await FormDefinition.createOne(payload);
        return mapFormRecord(created);
    }

    async replaceFormStructure(args: {
        key: string;
        structure: FormStructure;
        version: number;
        updatedBy: string;
    }): Promise<FormRecord | null> {
        const existing = await FormDefinition.one({ form_key: args.key });
        if (!existing) {
            return null;
        }
        const payload = FormDefinitionStructureUpdateSchema.parse({
            steps: args.structure.steps,
            sections: args.structure.sections,
            fields: args.structure.fields,
            version: args.version,
            updated_by: args.updatedBy,
            updated_at: toIsoDateString(new Date()),
        });
        await FormDefinition.updateByPk(
            readPrimaryKey(existing, 'form_definition_id'),
            payload,
        );
        return this.findForm({ key: args.key });
    }

    async publishForm(args: {
        key: string;
        version: number;
        updatedBy: string;
    }): Promise<FormRecord | null> {
        return this.updateFormStatus({
            key: args.key,
            status: 'published',
            version: args.version,
            updatedBy: args.updatedBy,
        });
    }

    async markFormDraft(args: {
        key: string;
        updatedBy: string;
    }): Promise<FormRecord | null> {
        return this.updateFormStatus({
            key: args.key,
            status: 'draft',
            updatedBy: args.updatedBy,
        });
    }

    async listLocationIds(args: { formKey: string }): Promise<string[]> {
        const rows = await FormLocation.filter({ form_key: args.formKey });
        const locationIds: string[] = [];
        for (const row of rows) {
            locationIds.push(mapLocationRecord(row).locationId);
        }
        return locationIds;
    }

    async listLocations(
        args: LocationListArgs,
    ): Promise<PageResult<LocationRecord>> {
        const where = searchWhere({
            search: args.search,
            fields: ['location_id', 'label'],
        });
        const [rows, total] = await Promise.all([
            FormLocation.filter(where, {
                skip: args.skip,
                take: args.take,
                order: {
                    [LOCATION_SORT_COLUMNS[args.sortBy]]: args.sortOrder,
                },
            }),
            FormLocation.countOf(where),
        ]);
        return { rows: mapRows(rows, mapLocationRecord), total };
    }

    async findLocation(args: {
        locationId: string;
    }): Promise<LocationRecord | null> {
        const row = await FormLocation.one({ location_id: args.locationId });
        return row ? mapLocationRecord(row) : null;
    }

    async createLocation(args: {
        input: LocationCreateInput;
    }): Promise<LocationRecord> {
        const payload = FormLocationCreateSchema.parse({
            location_id: args.input.locationId,
            label: args.input.label,
            hint: args.input.hint,
            form_key: null,
            updated_by: args.input.updatedBy,
            updated_at: toIsoDateString(new Date()),
        });
        const created = await FormLocation.createOne(payload);
        return mapLocationRecord(created);
    }

    async bindLocation(args: {
        locationId: string;
        formKey: string | null;
        updatedBy: string;
    }): Promise<LocationRecord | null> {
        const existing = await FormLocation.one({
            location_id: args.locationId,
        });
        if (!existing) {
            return null;
        }
        const payload = FormLocationBindSchema.parse({
            form_key: args.formKey,
            updated_by: args.updatedBy,
            updated_at: toIsoDateString(new Date()),
        });
        await FormLocation.updateByPk(
            readPrimaryKey(existing, 'form_location_id'),
            payload,
        );
        return this.findLocation({ locationId: args.locationId });
    }

    async deleteLocation(args: { locationId: string }): Promise<boolean> {
        const existing = await FormLocation.one({
            location_id: args.locationId,
        });
        if (!existing) {
            return false;
        }
        return (
            (await FormLocation.deleteByPk(
                readPrimaryKey(existing, 'form_location_id'),
            )) > 0
        );
    }

    async listTemplates(
        args: TemplateListArgs,
    ): Promise<PageResult<TemplateRecord>> {
        const where = searchWhere({
            search: args.search,
            fields: ['template_id', 'title'],
        });
        const [rows, total] = await Promise.all([
            FormFieldTemplate.filter(where, {
                skip: args.skip,
                take: args.take,
                order: {
                    [TEMPLATE_SORT_COLUMNS[args.sortBy]]: args.sortOrder,
                },
            }),
            FormFieldTemplate.countOf(where),
        ]);
        return { rows: mapRows(rows, mapTemplateRecord), total };
    }

    private async updateFormStatus(args: {
        key: string;
        status: FormStatus;
        version?: number;
        updatedBy: string;
    }): Promise<FormRecord | null> {
        const existing = await FormDefinition.one({ form_key: args.key });
        if (!existing) {
            return null;
        }
        const payload = FormDefinitionStatusUpdateSchema.parse({
            status: args.status,
            ...(args.version !== undefined ? { version: args.version } : {}),
            updated_by: args.updatedBy,
            updated_at: toIsoDateString(new Date()),
        });
        await FormDefinition.updateByPk(
            readPrimaryKey(existing, 'form_definition_id'),
            payload,
        );
        return this.findForm({ key: args.key });
    }
}

function mapRows<T>(rows: unknown[], mapRow: (row: unknown) => T): T[] {
    const mapped: T[] = [];
    for (const row of rows) {
        mapped.push(mapRow(row));
    }
    return mapped;
}

function searchWhere(args: {
    search: string | null;
    fields: string[];
}): Record<string, unknown> | Array<Record<string, unknown>> {
    if (!args.search) {
        return {};
    }
    const clauses: Array<Record<string, unknown>> = [];
    for (const field of args.fields) {
        clauses.push({ [field]: ILike(`%${args.search}%`) });
    }
    return clauses;
}

function readPrimaryKey(row: unknown, fieldName: string): number {
    if (!row || typeof row !== 'object') {
        throw new Error(`Expected object while reading '${fieldName}'`);
    }
    const value = Number((row as Record<string, unknown>)[fieldName]);
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`Expected numeric field '${fieldName}'`);
    }
    return value;
}

function createGeneratedFormsPersistenceAdapter(): FormsPersistenceAdapter {
    return new GeneratedFormsPersistenceAdapter();
}

export {
    GeneratedFormsPersistenceAdapter,
    createGeneratedFormsPersistenceAdapter,
};
