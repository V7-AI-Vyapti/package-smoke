import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getEntityWithName } from '@vyapti/core';
import { FORM_PERMISSION_CATALOG } from '@vyapti/forms';
import { readNumber } from '@vulcan/shared/utils/record-readers';
import { FormFieldTemplate } from '../entities/form_field_template.entity';
import { FORM_FIELD_TEMPLATE_SEED } from '../fixtures/form-field-templates';
import { GENERATED_FORMS_ENTITY_NAMES } from '../forms.constants';
import { FormFieldTemplateCreateSchema } from '../schema/form-field-template-write.schema';
import { bindFormsDataSource } from '../utils/can-configure-forms.util';

@Injectable()
class GeneratedFormsBootstrapService implements OnModuleInit {
    private readonly logger = new Logger(GeneratedFormsBootstrapService.name);

    constructor(
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {
        bindFormsDataSource(dataSource);
    }

    async onModuleInit(): Promise<void> {
        await this.upsertTemplates();
        await this.upsertFormCatalog();
    }

    private async upsertTemplates(): Promise<void> {
        let createdCount = 0;
        for (const template of FORM_FIELD_TEMPLATE_SEED) {
            const payload = FormFieldTemplateCreateSchema.parse(template);
            const { created } = await FormFieldTemplate.getOrCreate({
                where: { template_id: payload.template_id },
                create: payload,
            });
            if (created) {
                createdCount += 1;
            }
        }
        if (createdCount > 0) {
            this.logger.log(`Seeded ${createdCount} form field templates`);
        }
    }

    private async upsertFormCatalog(): Promise<void> {
        const catalogEntity = getEntityWithName(
            GENERATED_FORMS_ENTITY_NAMES.RBAC_CATALOG,
            this.dataSource,
        );
        for (const entry of FORM_PERMISSION_CATALOG) {
            const payload = {
                resource: entry.resource,
                actions: [...entry.actions],
            };
            const { entity, created } = await catalogEntity.getOrCreate({
                where: { resource: payload.resource },
                create: payload,
            });
            if (!created) {
                await catalogEntity.updateByPk(
                    readNumber(entity, 'rbac_catalog_id'),
                    { actions: payload.actions },
                );
            }
        }
    }
}

export { GeneratedFormsBootstrapService };
