import type {
    FormKind,
    FormRecord,
    FormSection,
    FormStatus,
    FormStep,
    FormStructure,
    LocationRecord,
    SortOrder,
    TemplateRecord,
} from './forms.types.js';

type FormListArgs = {
    search: string | null;
    skip: number;
    take: number;
    sortBy: 'key' | 'title' | 'status' | 'version';
    sortOrder: SortOrder;
};

type LocationListArgs = {
    search: string | null;
    skip: number;
    take: number;
    sortBy: 'locationId' | 'label';
    sortOrder: SortOrder;
};

type TemplateListArgs = {
    search: string | null;
    skip: number;
    take: number;
    sortBy: 'templateId' | 'title';
    sortOrder: SortOrder;
};

type PageResult<T> = {
    rows: T[];
    total: number;
};

type FormCreateInput = {
    key: string;
    title: string;
    description: string | null;
    brandImage: string;
    brandDetailRequired: boolean;
    kind: FormKind;
    status: Extract<FormStatus, 'draft'>;
    version: number;
    steps: FormStep[];
    sections: FormSection[];
    fields: FormStructure['fields'];
    updatedBy: string;
};

type LocationCreateInput = {
    locationId: string;
    label: string;
    hint: string | null;
    updatedBy: string;
};

type FormsPersistenceAdapter = {
    listForms(args: FormListArgs): Promise<PageResult<FormRecord>>;
    findForm(args: { key: string }): Promise<FormRecord | null>;
    createForm(args: { input: FormCreateInput }): Promise<FormRecord>;
    replaceFormStructure(args: {
        key: string;
        structure: FormStructure;
        version: number;
        updatedBy: string;
    }): Promise<FormRecord | null>;
    publishForm(args: {
        key: string;
        version: number;
        updatedBy: string;
    }): Promise<FormRecord | null>;
    markFormDraft(args: {
        key: string;
        updatedBy: string;
    }): Promise<FormRecord | null>;
    listLocationIds(args: { formKey: string }): Promise<string[]>;
    listLocations(args: LocationListArgs): Promise<PageResult<LocationRecord>>;
    findLocation(args: { locationId: string }): Promise<LocationRecord | null>;
    createLocation(args: {
        input: LocationCreateInput;
    }): Promise<LocationRecord>;
    bindLocation(args: {
        locationId: string;
        formKey: string | null;
        updatedBy: string;
    }): Promise<LocationRecord | null>;
    deleteLocation(args: { locationId: string }): Promise<boolean>;
    listTemplates(args: TemplateListArgs): Promise<PageResult<TemplateRecord>>;
};

export type {
    FormCreateInput,
    FormListArgs,
    FormsPersistenceAdapter,
    LocationCreateInput,
    LocationListArgs,
    PageResult,
    TemplateListArgs,
};
