import { FORMS_DEFAULTS, FORMS_MESSAGES } from '../forms.constants.js';
import type {
    FormsModuleRootOptions,
    ResolvedFormsModuleOptions,
} from '../types/module.types.js';

function normalizeRoutePrefix(routePrefix: string): string {
    return routePrefix.trim().replace(/^\/+|\/+$/g, '');
}

function resolveFormsModuleOptions(
    options: FormsModuleRootOptions,
): ResolvedFormsModuleOptions {
    if (!options.persistence) {
        throw new Error(FORMS_MESSAGES.PERSISTENCE_REQUIRED);
    }
    if (typeof options.canConfigureForms !== 'function') {
        throw new Error(FORMS_MESSAGES.CONFIGURE_REQUIRED);
    }

    const routePrefix = normalizeRoutePrefix(options.routePrefix);
    if (routePrefix.length === 0) {
        throw new Error(FORMS_MESSAGES.ROUTE_PREFIX_REQUIRED);
    }

    const forbiddenAs = options.forbiddenAs ?? FORMS_DEFAULTS.FORBIDDEN_AS;
    if (forbiddenAs !== '404') {
        throw new Error(FORMS_MESSAGES.FORBIDDEN_AS_UNSUPPORTED);
    }

    return {
        routePrefix,
        forbiddenAs,
        canConfigureForms: options.canConfigureForms,
        onFormEvent: options.onFormEvent,
    };
}

export { resolveFormsModuleOptions };
