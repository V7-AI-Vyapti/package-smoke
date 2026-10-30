import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

type FormErrorStatus = 'bad_request' | 'not_found' | 'conflict';

function throwFormError(args: {
    status: FormErrorStatus;
    code: string;
    message: string;
}): never {
    const body = { message: args.message, code: args.code };
    if (args.status === 'not_found') {
        throw new NotFoundException(body);
    }
    if (args.status === 'conflict') {
        throw new ConflictException(body);
    }
    throw new BadRequestException(body);
}

export { throwFormError };
