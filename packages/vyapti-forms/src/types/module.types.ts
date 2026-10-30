import type { FormsPersistenceAdapter } from './persistence.types.js';
import type { FormEvent, FormsSessionUser } from './forms.types.js';

type ConfigureForms = {
    (user: FormsSessionUser): boolean | Promise<boolean>;
};

type FormEventHook = {
    (event: FormEvent): void | Promise<void>;
};

type FormsModuleRootOptions = {
    routePrefix: string;
    persistence: FormsPersistenceAdapter;
    forbiddenAs?: '404';
    canConfigureForms: ConfigureForms;
    onFormEvent?: FormEventHook;
};

type ResolvedFormsModuleOptions = {
    routePrefix: string;
    forbiddenAs: '404';
    canConfigureForms: FormsModuleRootOptions['canConfigureForms'];
    onFormEvent?: FormsModuleRootOptions['onFormEvent'];
};

export type { FormsModuleRootOptions, ResolvedFormsModuleOptions };
