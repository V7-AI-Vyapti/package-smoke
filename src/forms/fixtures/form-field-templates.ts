const FORM_FIELD_TEMPLATE_SEED = [
    template('full_name', 'Full name', { widget: 'text', required: true }),
    template('phone', 'Phone', { widget: 'text', required: true }),
    template('email', 'Email', { widget: 'text', required: true }),
    template('date_of_birth', 'Date of birth', { widget: 'date' }),
    template('gender', 'Gender', {
        widget: 'select',
        optionSource: 'static',
        options: [
            { id: 'female', label: 'Female' },
            { id: 'male', label: 'Male' },
            { id: 'other', label: 'Other' },
        ],
    }),
    template('address', 'Address', { widget: 'long_text' }),
    template('pincode', 'PINCODE', { widget: 'text' }),
    template('photo', 'Photo', { widget: 'photo' }),
    template('document', 'Document', { widget: 'document' }),
    template('place', 'Place', { widget: 'geo' }),
    template('heading', 'Heading', { widget: 'heading' }),
    template('yes_no', 'Yes / no', { widget: 'yes_no' }),
    template('number', 'Number', { widget: 'number' }),
    template('long_text', 'Long text', { widget: 'long_text' }),
] as const;

function template(
    templateId: string,
    title: string,
    field: Record<string, unknown>,
): {
    template_id: string;
    title: string;
    field: Record<string, unknown>;
} {
    return {
        template_id: templateId,
        title,
        field: {
            key: templateId,
            label: title,
            required: false,
            enabled: true,
            optionSource: 'static',
            options: [],
            ...field,
        },
    };
}

export { FORM_FIELD_TEMPLATE_SEED };
