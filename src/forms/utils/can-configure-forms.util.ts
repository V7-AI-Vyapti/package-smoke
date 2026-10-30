import { DataSource } from 'typeorm';
import { getEntityWithName } from '@vyapti/core';
import type { FormsSessionUser } from '@vyapti/forms';
import { parsePositiveId } from '@auth/utils/parse-positive-id.util';
import { readBoolean, readString } from '@vulcan/shared/utils/record-readers';
import {
    GENERATED_FORMS_ADMIN_ROLE_NAME,
    GENERATED_FORMS_ENTITY_NAMES,
} from '../forms.constants';

let formsDataSource: DataSource | undefined;

function bindFormsDataSource(value: DataSource): void {
    formsDataSource = value;
}

function requireFormsDataSource(): DataSource {
    if (!formsDataSource) {
        throw new Error('Forms DataSource is not bound');
    }
    return formsDataSource;
}

async function canConfigureForms(user: FormsSessionUser): Promise<boolean> {
    const userId = parsePositiveId(user.id);
    if (userId == null) {
        return false;
    }
    const dataSource = requireFormsDataSource();
    const userEntity = getEntityWithName(
        GENERATED_FORMS_ENTITY_NAMES.USER,
        dataSource,
    );
    const userRow = await userEntity.getByPk(userId);
    if (!userRow) {
        return false;
    }
    const roleId = readRoleId(userRow);
    if (roleId == null) {
        return false;
    }
    const roleEntity = getEntityWithName(
        GENERATED_FORMS_ENTITY_NAMES.ROLE,
        dataSource,
    );
    const role = await roleEntity.getByPk(roleId);
    if (!role) {
        return false;
    }
    if (readBoolean(role, 'full_access')) {
        return true;
    }
    return (
        readBoolean(role, 'is_system') &&
        readString(role, 'name') === GENERATED_FORMS_ADMIN_ROLE_NAME
    );
}

function readRoleId(record: unknown): number | null {
    if (!record || typeof record !== 'object') {
        return null;
    }
    const value = (record as Record<string, unknown>)['role_id'];
    if (value == null) {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return null;
    }
    return parsed;
}

export { bindFormsDataSource, canConfigureForms };
