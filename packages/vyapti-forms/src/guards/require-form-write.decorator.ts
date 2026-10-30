import { applyDecorators, UseGuards } from '@nestjs/common';
import { RequirePermission } from '@vyapti/rbac';
import { ConfigureFormsGuard } from './configure-forms.guard.js';

function RequireFormWrite(resource: string, action: string): MethodDecorator {
    return applyDecorators(
        UseGuards(ConfigureFormsGuard),
        RequirePermission(resource, action),
    );
}

export { RequireFormWrite };
