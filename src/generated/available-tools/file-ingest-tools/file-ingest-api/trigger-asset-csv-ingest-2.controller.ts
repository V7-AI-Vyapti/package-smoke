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
    ASSET_CSV_INGEST_QUEUE,
    ASSET_CSV_INGEST_JOB,
} from '@available-tools/file-ingest-tools/file-ingest-worker/asset-csv-ingest-2.worker';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TriggerAssetCsvIngestRequestSchema = z.object({
    file_id: z.coerce.number().int().min(1),
});

export class TriggerAssetCsvIngestRequestDto extends createZodDto(
    TriggerAssetCsvIngestRequestSchema,
) {}

type TriggerAssetCsvIngestResponseDto = {
    file_id: number;
    process_id: number;
    job_id: string;
    status: 'INITIATED';
};

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class TriggerAssetCsvIngestController {
    constructor(
        @InjectQueue(ASSET_CSV_INGEST_QUEUE)
        private readonly dataIngestionQueue: Queue,
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {}

    @RequirePermission('asset_csv_ingest', 'run')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/files/ingest/asset-csv-ingest',
        tags: ['File Ingest'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]:
                'asset_csv_ingest file ingest process initiated',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async triggerAssetCsvIngest(
        @Body() body: TriggerAssetCsvIngestRequestDto,
    ): Promise<ApiSuccessResponse<TriggerAssetCsvIngestResponseDto>> {
        const fileId = body.file_id;
        const processName = generateProcessName({
            processNamePrefix: 'asset_csv_ingest',
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
            tool_name: 'asset_csv_ingest',
            process_metadata: processMetadata,
            description: 'asset_csv_ingest file ingest process',
        });
        const job = await this.dataIngestionQueue.add(ASSET_CSV_INGEST_JOB, {
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
