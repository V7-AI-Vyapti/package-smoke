import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';

class FormFieldTemplate extends CustomTypeormEntityBase {
    static tableName = 'form_field_template';
    static uniques = [['template_id']];
    form_field_template_id = CustomTypeormFields.AutoPK({
        db_column: 'form_field_template_id',
    });
    template_id = CustomTypeormFields.CharacterString({
        db_column: 'template_id',
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
    field = CustomTypeormFields.JSON({
        db_column: 'field',
        null: false,
        blank: false,
    });
}

export { FormFieldTemplate };
