import { readValue } from '@vulcan/shared/utils/record-readers';

function readJson(record: unknown, fieldName: string): unknown {
    const value = readValue(record, fieldName);
    if (typeof value === 'string') {
        return JSON.parse(value);
    }
    return value;
}

function readJsonArray<T>(record: unknown, fieldName: string): T[] {
    const value = readJson(record, fieldName);
    if (!Array.isArray(value)) {
        throw new Error(`Expected array field '${fieldName}'`);
    }
    return value as T[];
}

function readJsonObject(
    record: unknown,
    fieldName: string,
): Record<string, unknown> {
    const value = readJson(record, fieldName);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Expected object field '${fieldName}'`);
    }
    return value as Record<string, unknown>;
}

export { readJson, readJsonArray, readJsonObject };
