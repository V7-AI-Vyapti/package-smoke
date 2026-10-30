import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Batch extends CustomTypeormEntityBase {
    static tableName = 'batch';
    batch_id = CustomTypeormFields.AutoPK({ db_column: 'batch_id' });
    batch_name = CustomTypeormFields.CharacterString({
        db_column: 'batch_name',
    });
    status = CustomTypeormFields.CharacterString({ db_column: 'status' });
    district_id = CustomTypeormFields.FK({
        model_name: 'district',
        db_column: 'district_id',
    });
    organisation_id = CustomTypeormFields.FK({
        model_name: 'organisation',
        db_column: 'organisation_id',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
