import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Worker extends CustomTypeormEntityBase {
    static tableName = 'worker';
    worker_id = CustomTypeormFields.AutoPK({ db_column: 'worker_id' });
    full_name = CustomTypeormFields.CharacterString({ db_column: 'full_name' });
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
