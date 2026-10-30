import { Module } from '@nestjs/common';
import { FormBuilderModule } from '@vyapti/forms';
import { GENERATED_FORMS_CONFIG } from './forms.config';
import { createGeneratedFormsPersistenceAdapter } from './persistence/generated-forms-persistence.adapter';
import { GeneratedFormsBootstrapService } from './services/generated-forms-bootstrap.service';
import { canConfigureForms } from './utils/can-configure-forms.util';

@Module({
    imports: [
        FormBuilderModule.forRoot({
            routePrefix: GENERATED_FORMS_CONFIG.ROUTE_PREFIX,
            forbiddenAs: GENERATED_FORMS_CONFIG.FORBIDDEN_AS,
            persistence: createGeneratedFormsPersistenceAdapter(),
            canConfigureForms,
        }),
    ],
    providers: [GeneratedFormsBootstrapService],
})
class GeneratedFormsModule {}

export { GeneratedFormsModule };
