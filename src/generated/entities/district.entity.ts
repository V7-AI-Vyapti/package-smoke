import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class District extends CustomTypeormEntityBase {
    static tableName = 'district';
    district_id = CustomTypeormFields.AutoPK({ db_column: 'district_id' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    state_id = CustomTypeormFields.FK({
        model_name: 'state',
        db_column: 'state_id',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
