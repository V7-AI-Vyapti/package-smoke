import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FORMS_MESSAGES } from '../forms.constants.js';
import { FORMS_MODULE_OPTIONS } from '../forms.tokens.js';
import type { ResolvedFormsModuleOptions } from '../types/module.types.js';
import type { FormsRequest } from '../types/forms.types.js';
import { readSessionUser } from '../utils/read-session-user.util.js';

@Injectable()
class ConfigureFormsGuard implements CanActivate {
    constructor(
        @Inject(FORMS_MODULE_OPTIONS)
        private readonly options: ResolvedFormsModuleOptions,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FormsRequest>();
        const user = readSessionUser(request);
        const allowed = await this.options.canConfigureForms(user);
        if (!allowed) {
            throw new NotFoundException(FORMS_MESSAGES.ACCESS_DENIED);
        }
        return true;
    }
}

export { ConfigureFormsGuard };
