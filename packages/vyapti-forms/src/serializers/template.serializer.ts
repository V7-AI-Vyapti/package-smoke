import type { TemplateRecord } from '../types/forms.types.js';

type TemplateResponse = {
    templateId: string;
    title: string;
    field: Record<string, unknown>;
};

function serializeTemplate(template: TemplateRecord): TemplateResponse {
    return {
        templateId: template.templateId,
        title: template.title,
        field: template.field,
    };
}

function serializeTemplates(templates: TemplateRecord[]): TemplateResponse[] {
    const responses: TemplateResponse[] = [];
    for (const template of templates) {
        responses.push(serializeTemplate(template));
    }
    return responses;
}

export { serializeTemplate, serializeTemplates };
export type { TemplateResponse };
