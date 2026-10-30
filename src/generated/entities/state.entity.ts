import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class State extends CustomTypeormEntityBase {
    static tableName = 'state';
    state_id = CustomTypeormFields.AutoPK({ db_column: 'state_id' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
