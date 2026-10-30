import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';

class FormLocation extends CustomTypeormEntityBase {
    static tableName = 'form_location';
    static uniques = [['location_id']];
    form_location_id = CustomTypeormFields.AutoPK({
        db_column: 'form_location_id',
    });
    location_id = CustomTypeormFields.CharacterString({
        db_column: 'location_id',
        null: false,
        blank: false,
        max_length: 200,
    });
    label = CustomTypeormFields.CharacterString({
        db_column: 'label',
        null: false,
        blank: false,
        max_length: 200,
    });
    hint = CustomTypeormFields.CharacterString({
        db_column: 'hint',
        null: true,
        blank: true,
        max_length: 500,
    });
    form_key = CustomTypeormFields.CharacterString({
        db_column: 'form_key',
        null: true,
        blank: true,
        max_length: 100,
    });
    updated_by = CustomTypeormFields.CharacterString({
        db_column: 'updated_by',
        null: true,
        blank: true,
        max_length: 64,
    });
    updated_at = CustomTypeormFields.CharacterString({
        db_column: 'updated_at',
        null: false,
        blank: false,
        max_length: 64,
    });
}

export { FormLocation };
