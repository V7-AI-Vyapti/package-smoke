import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';

class FormDefinition extends CustomTypeormEntityBase {
    static tableName = 'form_definition';
    static uniques = [['form_key']];
    form_definition_id = CustomTypeormFields.AutoPK({
        db_column: 'form_definition_id',
    });
    form_key = CustomTypeormFields.CharacterString({
        db_column: 'form_key',
        null: false,
        blank: false,
        max_length: 100,
    });
    title = CustomTypeormFields.CharacterString({
        db_column: 'title',
        null: false,
        blank: false,
        max_length: 200,
    });
    description = CustomTypeormFields.Text({
        db_column: 'description',
        null: true,
        blank: true,
    });
    brand_image = CustomTypeormFields.Text({
        db_column: 'brand_image',
        null: false,
        blank: false,
    });
    brand_detail_required = CustomTypeormFields.Boolean({
        db_column: 'brand_detail_required',
        null: false,
        blank: false,
        default: true,
    });
    kind = CustomTypeormFields.CharacterString({
        db_column: 'kind',
        null: false,
        blank: false,
        max_length: 32,
    });
    status = CustomTypeormFields.CharacterString({
        db_column: 'status',
        null: false,
        blank: false,
        max_length: 32,
    });
    version = CustomTypeormFields.Integer({
        db_column: 'version',
        null: false,
        blank: false,
        default: 1,
    });
    steps = CustomTypeormFields.JSON({
        db_column: 'steps',
        null: false,
        blank: false,
    });
    sections = CustomTypeormFields.JSON({
        db_column: 'sections',
        null: false,
        blank: false,
    });
    fields = CustomTypeormFields.JSON({
        db_column: 'fields',
        null: false,
        blank: false,
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

export { FormDefinition };
