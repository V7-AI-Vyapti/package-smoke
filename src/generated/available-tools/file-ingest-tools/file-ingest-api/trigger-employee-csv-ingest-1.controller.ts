import { Body, Controller, Inject } from '@nestjs/common';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import {
    createProcessEntity,
    generateProcessName,
    PROCESS_STATUS,
} from '@vyapti/core/file-ingest-tool-utils';
import {
    EMPLOYEE_CSV_INGEST_QUEUE,
    EMPLOYEE_CSV_INGEST_JOB,
} from '@available-tools/file-ingest-tools/file-ingest-worker/employee-csv-ingest-1.worker';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TriggerEmployeeCsvIngestRequestSchema = z.object({
    file_id: z.coerce.number().int().min(1),
});

export class TriggerEmployeeCsvIngestRequestDto extends createZodDto(
    TriggerEmployeeCsvIngestRequestSchema,
) {}

type TriggerEmployeeCsvIngestResponseDto = {
    file_id: number;
    process_id: number;
    job_id: string;
    status: 'INITIATED';
};

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class TriggerEmployeeCsvIngestController {
    constructor(
        @InjectQueue(EMPLOYEE_CSV_INGEST_QUEUE)
        private readonly dataIngestionQueue: Queue,
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {}

    @RequirePermission('employee_csv_ingest', 'run')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/files/ingest/employee-csv-ingest',
        tags: ['File Ingest'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: ' initiated',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async triggerEmployeeCsvIngest(
        @Body() body: TriggerEmployeeCsvIngestRequestDto,
    ): Promise<ApiSuccessResponse<TriggerEmployeeCsvIngestResponseDto>> {
        const fileId = body.file_id;
        const processName = generateProcessName({
            processNamePrefix: 'employee_csv_ingest',
            fileId: fileId,
        });
        const currentTimestamp = new Date().toISOString();
        const processMetadata = {
            file_id: fileId,
            triggered_at: currentTimestamp,
        };
        const processId = await createProcessEntity({
            dataSource: this.dataSource,
            process_name: processName,
            process_status_name: PROCESS_STATUS.QUEUED,
            tool_type_name: 'file_ingest_protocol',
            tool_name: 'employee_csv_ingest',
            process_metadata: processMetadata,
            description: '',
        });
        const job = await this.dataIngestionQueue.add(EMPLOYEE_CSV_INGEST_JOB, {
            process_id: processId,
            file_id: fileId,
        });
        return apiSuccess({
            file_id: fileId,
            process_id: processId,
            job_id: String(job.id),
            status: 'INITIATED',
        });
    }
}
