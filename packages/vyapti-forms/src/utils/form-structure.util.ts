import { FORMS_ERROR_CODES, FORMS_MESSAGES } from '../forms.constants.js';
import type {
    FormField,
    FormSection,
    FormStep,
    FormStructure,
} from '../types/forms.types.js';
import { throwFormError } from './throw-form-error.util.js';

function upsertField(args: {
    structure: FormStructure;
    field: FormField;
    previousKey: string | null;
    orderProvided: boolean;
}): FormStructure {
    const next = cloneStructure(args.structure);
    const fromKey = args.previousKey ?? args.field.key;
    const index = findFieldIndex(next.fields, fromKey);
    if (args.previousKey && index < 0) {
        throwMissingField();
    }
    if (
        fromKey !== args.field.key &&
        findFieldIndex(next.fields, args.field.key) >= 0
    ) {
        throwDuplicate();
    }

    const field = cloneField(args.field);
    if (index < 0) {
        field.order = args.orderProvided
            ? args.field.order
            : nextOrder(next.fields);
        next.fields.push(field);
    } else {
        field.order = args.orderProvided
            ? args.field.order
            : next.fields[index].order;
        next.fields[index] = field;
    }
    assertFieldPlacement(next, field);
    return next;
}

function removeField(args: {
    structure: FormStructure;
    fieldKey: string;
}): FormStructure {
    const next = cloneStructure(args.structure);
    const index = findFieldIndex(next.fields, args.fieldKey);
    if (index < 0) {
        throwMissingField();
    }
    next.fields.splice(index, 1);
    return next;
}

function upsertStep(args: {
    structure: FormStructure;
    step: FormStep;
    previousId: string | null;
    orderProvided: boolean;
}): FormStructure {
    const next = cloneStructure(args.structure);
    const fromId = args.previousId ?? args.step.id;
    const index = findStepIndex(next.steps, fromId);
    if (args.previousId && index < 0) {
        throwMissingStep();
    }
    if (
        fromId !== args.step.id &&
        findStepIndex(next.steps, args.step.id) >= 0
    ) {
        throwDuplicate();
    }

    if (index < 0) {
        const step = {
            ...args.step,
            order: args.orderProvided ? args.step.order : nextOrder(next.steps),
        };
        next.steps.push(step);
        next.sections.push(defaultSection(next, step));
        return next;
    }

    const previous = next.steps[index];
    const step = {
        ...args.step,
        order: args.orderProvided ? args.step.order : previous.order,
    };
    next.steps[index] = step;
    if (previous.id !== step.id) {
        remapStepId(next, previous.id, step.id);
    }
    return next;
}

function removeStep(args: {
    structure: FormStructure;
    stepId: string;
}): FormStructure {
    const next = cloneStructure(args.structure);
    if (next.steps.length <= 1) {
        throwLastStep();
    }
    const index = findStepIndex(next.steps, args.stepId);
    if (index < 0) {
        throwMissingStep();
    }
    if (stepHasFields(next, args.stepId)) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.STEP_IN_USE,
            message: FORMS_MESSAGES.STEP_IN_USE,
        });
    }
    next.steps.splice(index, 1);
    next.sections = sectionsExcept(next.sections, args.stepId);
    return next;
}

function acceptStructure(structure: FormStructure): FormStructure {
    if (structure.steps.length === 0) {
        throwLastStep();
    }
    assertUnique(stepIds(structure), FORMS_MESSAGES.DUPLICATE_KEY);
    assertUnique(sectionIds(structure), FORMS_MESSAGES.DUPLICATE_KEY);
    assertUnique(fieldKeys(structure), FORMS_MESSAGES.DUPLICATE_KEY);
    assertReferences(structure);
    return structure;
}

function defaultSection(structure: FormStructure, step: FormStep): FormSection {
    const id = `${step.id}_section`;
    if (findSectionIndex(structure.sections, id) >= 0) {
        throwDuplicate();
    }
    return {
        id,
        stepId: step.id,
        title: step.title,
        hint: null,
        order: 0,
    };
}

function remapStepId(structure: FormStructure, fromId: string, toId: string): void {
    for (const section of structure.sections) {
        if (section.stepId === fromId) {
            section.stepId = toId;
        }
    }
    for (const field of structure.fields) {
        if (field.stepId === fromId) {
            field.stepId = toId;
        }
    }
}

function assertFieldPlacement(structure: FormStructure, field: FormField): void {
    const section = findSection(structure.sections, field.sectionId);
    const step = findStep(structure.steps, field.stepId);
    if (!section || !step || section.stepId !== field.stepId) {
        throwFormError({
            status: 'bad_request',
            code: FORMS_ERROR_CODES.VALUE_REQUIRED,
            message: FORMS_MESSAGES.PLACEMENT_INVALID,
        });
    }
}

function assertReferences(structure: FormStructure): void {
    for (const section of structure.sections) {
        if (!findStep(structure.steps, section.stepId)) {
            throwPlacement();
        }
    }
    for (const field of structure.fields) {
        assertFieldPlacement(structure, field);
    }
}

function assertUnique(ids: string[], message: string): void {
    const seen = new Set<string>();
    for (const id of ids) {
        if (seen.has(id)) {
            throwFormError({
                status: 'conflict',
                code: FORMS_ERROR_CODES.DUPLICATE_KEY,
                message,
            });
        }
        seen.add(id);
    }
}

function cloneStructure(structure: FormStructure): FormStructure {
    const steps: FormStep[] = [];
    const sections: FormSection[] = [];
    const fields: FormField[] = [];
    for (const step of structure.steps) {
        steps.push({ ...step });
    }
    for (const section of structure.sections) {
        sections.push({ ...section });
    }
    for (const field of structure.fields) {
        fields.push(cloneField(field));
    }
    return { steps, sections, fields };
}

function cloneField(field: FormField): FormField {
    const options: FormField['options'] = [];
    for (const option of field.options) {
        options.push({ id: option.id, label: option.label });
    }
    return { ...field, options, extras: { ...field.extras } };
}

function sectionsExcept(sections: FormSection[], stepId: string): FormSection[] {
    const kept: FormSection[] = [];
    for (const section of sections) {
        if (section.stepId !== stepId) {
            kept.push(section);
        }
    }
    return kept;
}

function stepHasFields(structure: FormStructure, stepId: string): boolean {
    for (const field of structure.fields) {
        if (field.stepId === stepId) {
            return true;
        }
    }
    return false;
}

function nextOrder(items: readonly { order: number }[]): number {
    let max = -1;
    for (const item of items) {
        if (item.order > max) {
            max = item.order;
        }
    }
    return max + 1;
}

function findFieldIndex(fields: FormField[], key: string): number {
    for (let index = 0; index < fields.length; index += 1) {
        if (fields[index].key === key) {
            return index;
        }
    }
    return -1;
}

function findStepIndex(steps: FormStep[], id: string): number {
    for (let index = 0; index < steps.length; index += 1) {
        if (steps[index].id === id) {
            return index;
        }
    }
    return -1;
}

function findSectionIndex(sections: FormSection[], id: string): number {
    for (let index = 0; index < sections.length; index += 1) {
        if (sections[index].id === id) {
            return index;
        }
    }
    return -1;
}

function findStep(steps: FormStep[], id: string): FormStep | null {
    const index = findStepIndex(steps, id);
    if (index < 0) {
        return null;
    }
    return steps[index];
}

function findSection(sections: FormSection[], id: string): FormSection | null {
    const index = findSectionIndex(sections, id);
    if (index < 0) {
        return null;
    }
    return sections[index];
}

function stepIds(structure: FormStructure): string[] {
    const ids: string[] = [];
    for (const step of structure.steps) {
        ids.push(step.id);
    }
    return ids;
}

function sectionIds(structure: FormStructure): string[] {
    const ids: string[] = [];
    for (const section of structure.sections) {
        ids.push(section.id);
    }
    return ids;
}

function fieldKeys(structure: FormStructure): string[] {
    const keys: string[] = [];
    for (const field of structure.fields) {
        keys.push(field.key);
    }
    return keys;
}

function throwDuplicate(): never {
    throwFormError({
        status: 'conflict',
        code: FORMS_ERROR_CODES.DUPLICATE_KEY,
        message: FORMS_MESSAGES.DUPLICATE_KEY,
    });
}

function throwMissingField(): never {
    throwFormError({
        status: 'not_found',
        code: FORMS_ERROR_CODES.NOT_FOUND,
        message: FORMS_MESSAGES.FIELD_NOT_FOUND,
    });
}

function throwMissingStep(): never {
    throwFormError({
        status: 'not_found',
        code: FORMS_ERROR_CODES.NOT_FOUND,
        message: FORMS_MESSAGES.STEP_NOT_FOUND,
    });
}

function throwLastStep(): never {
    throwFormError({
        status: 'bad_request',
        code: FORMS_ERROR_CODES.LAST_STEP,
        message: FORMS_MESSAGES.LAST_STEP,
    });
}

function throwPlacement(): never {
    throwFormError({
        status: 'bad_request',
        code: FORMS_ERROR_CODES.VALUE_REQUIRED,
        message: FORMS_MESSAGES.PLACEMENT_INVALID,
    });
}

export { acceptStructure, removeField, removeStep, upsertField, upsertStep };
