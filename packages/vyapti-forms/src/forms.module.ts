import { DynamicModule, Module, type Provider, type Type } from '@nestjs/common';
import { FormsController } from './controller/forms.controller.js';
import { LocationsController } from './controller/locations.controller.js';
import { TemplatesController } from './controller/templates.controller.js';
import { ConfigureFormsGuard } from './guards/configure-forms.guard.js';
import { FORMS_MODULE_OPTIONS, FORMS_PERSISTENCE_ADAPTER } from './forms.tokens.js';
import { FormStore } from './services/form-store.service.js';
import { FormsService } from './services/forms.service.js';
import { LocationsService } from './services/locations.service.js';
import { TemplatesService } from './services/templates.service.js';
import type { FormsModuleRootOptions } from './types/module.types.js';
import { applyControllerPath } from './utils/apply-controller-path.util.js';
import { resolveFormsModuleOptions } from './utils/resolve-forms-module-options.util.js';

// Literal `locations` and `templates` must register before `GET :key`.
const FORMS_CONTROLLERS: Array<Type<unknown>> = [
    TemplatesController,
    LocationsController,
    FormsController,
];

const FORMS_SERVICES: Provider[] = [
    ConfigureFormsGuard,
    FormStore,
    LocationsService,
    FormsService,
    TemplatesService,
];

@Module({})
class FormBuilderModule {
    static forRoot(options: FormsModuleRootOptions): DynamicModule {
        const resolved = resolveFormsModuleOptions(options);
        applyControllerPath({
            controllers: FORMS_CONTROLLERS,
            path: resolved.routePrefix,
        });

        return {
            module: FormBuilderModule,
            global: false,
            controllers: FORMS_CONTROLLERS,
            providers: [
                {
                    provide: FORMS_MODULE_OPTIONS,
                    useValue: resolved,
                },
                {
                    provide: FORMS_PERSISTENCE_ADAPTER,
                    useValue: options.persistence,
                },
                ...FORMS_SERVICES,
            ],
            exports: [FORMS_MODULE_OPTIONS, FORMS_PERSISTENCE_ADAPTER],
        };
    }
}

export { FormBuilderModule };
