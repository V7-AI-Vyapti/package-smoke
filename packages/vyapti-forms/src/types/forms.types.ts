import type { FORM_EVENTS, FORM_KIND, FORM_STATUS } from '../forms.constants.js';

type FormKind = (typeof FORM_KIND)[keyof typeof FORM_KIND];
type FormStatus = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];
type FormEventName = (typeof FORM_EVENTS)[keyof typeof FORM_EVENTS];
type FormEventEntityType = 'form' | 'form_location';

type FormFieldOption = {
    id: string;
    label: string;
};

type FormStep = {
    id: string;
    title: string;
    hint: string | null;
    order: number;
};

type FormSection = {
    id: string;
    stepId: string;
    title: string;
    hint: string | null;
    order: number;
};

type FormField = {
    key: string;
    label: string;
    widget: string;
    stepId: string;
    sectionId: string;
    order: number;
    required: boolean;
    enabled: boolean;
    placeholder: string | null;
    hint: string | null;
    options: FormFieldOption[];
    optionSource: string;
    col: number | null;
    span: number | null;
    row: number | null;
    spanLocked: boolean;
    extras: Record<string, unknown>;
};

type FormStructure = {
    steps: FormStep[];
    sections: FormSection[];
    fields: FormField[];
};

type FormRecord = {
    key: string;
    title: string;
    description: string | null;
    brandImage: string;
    brandDetailRequired: boolean;
    kind: FormKind;
    status: FormStatus;
    version: number;
    steps: FormStep[];
    sections: FormSection[];
    fields: FormField[];
    updatedBy: string | null;
    updatedAt: Date | string;
};

type FormView = FormRecord & {
    locationIds: string[];
};

type BoundFormSummary = {
    key: string;
    title: string;
    status: FormStatus;
    version: number;
    kind: FormKind;
};

type LocationRecord = {
    locationId: string;
    label: string;
    hint: string | null;
    formKey: string | null;
    updatedBy: string | null;
    updatedAt: Date | string;
};

type LocationView = LocationRecord & {
    form: BoundFormSummary | null;
};

type TemplateRecord = {
    templateId: string;
    title: string;
    field: Record<string, unknown>;
};

type FormEvent = {
    event: FormEventName;
    entityType: FormEventEntityType;
    formKey?: string;
    locationId?: string;
    actorUserId: string;
};

type FormsSessionUser = {
    id: string;
};

type FormsRequest = {
    user?: unknown;
};

type FormStructureChange = {
    (structure: FormStructure): FormStructure;
};

type SortOrder = 'ASC' | 'DESC';

export type {
    BoundFormSummary,
    FormEvent,
    FormEventEntityType,
    FormEventName,
    FormField,
    FormFieldOption,
    FormKind,
    FormRecord,
    FormSection,
    FormStatus,
    FormStep,
    FormStructure,
    FormStructureChange,
    FormView,
    FormsRequest,
    FormsSessionUser,
    LocationRecord,
    LocationView,
    SortOrder,
    TemplateRecord,
};
