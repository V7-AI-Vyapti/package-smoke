import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Job } from 'bullmq';
import { bulk_insert_entity_records } from '@vyapti/core';
import { parse_file_content_to_records } from '@vyapti/function-registry';
import {
    bindUpdateProcessStatus,
    getFileById,
    getFileMetaByFileId,
    PROCESS_STATUS,
    runWithProcessStatus,
} from '@vyapti/core/file-ingest-tool-utils';
import { downloadFileBuffer } from '@vyapti/file-storage';
import { readString } from '@vulcan/shared/utils/record-readers';

type AssetCsvIngestJobData = {
    process_id: number;
    file_id: number;
};

const ASSET_CSV_INGEST_QUEUE = 'data_ingestion_asset_csv_ingest';
const ASSET_CSV_INGEST_JOB = 'file_ingest_protocol_asset_csv_ingest_data';

@Processor(ASSET_CSV_INGEST_QUEUE)
export class AssetCsvIngestWorker extends WorkerHost {
    constructor(
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {
        super();
    }

    async process(job: Job<AssetCsvIngestJobData>): Promise<void> {
        if (job.name !== ASSET_CSV_INGEST_JOB) {
            return;
        }

        const updateProcessStatusForJob = bindUpdateProcessStatus({
            dataSource: this.dataSource,
        });

        await runWithProcessStatus({
            job: job,
            task: this.runAssetCsvIngest.bind(this),
            updateProcessStatus: updateProcessStatusForJob,
            runningStatus: PROCESS_STATUS.RUNNING,
            successStatus: PROCESS_STATUS.SUCCESS,
            failedStatus: PROCESS_STATUS.FAILED,
        });
    }

    private async runAssetCsvIngest(
        job: Job<AssetCsvIngestJobData>,
    ): Promise<Record<string, unknown>> {
        const { file_id: fileId } = job.data;

        const file = await getFileById({
            fileId: fileId,
            dataSource: this.dataSource,
        });
        const fileMeta = await getFileMetaByFileId({
            fileId: fileId,
            dataSource: this.dataSource,
        });
        const storagePath = readString(fileMeta, 'storage_path');
        const bucketName = readString(fileMeta, 'bucket_name');
        const fileBuffer = await downloadFileBuffer({
            storagePath: storagePath,
            bucketName: bucketName,
        });
        const fileContent = fileBuffer.toString('utf-8');

        // generated tool_details chain
        let records = parse_file_content_to_records({
            text: fileContent,
            file: file,
            fileMeta: fileMeta,
            fields: [],
        });

        await bulk_insert_entity_records({
            dataSource: this.dataSource,
            entityName: 'organisation',
            data: records,
        });

        return {
            file_id: fileId,
            file_name: readString(file, 'file_name'),
            ingested_record_count: Array.isArray(records) ? records.length : 1,
        };
    }
}

export { ASSET_CSV_INGEST_QUEUE, ASSET_CSV_INGEST_JOB };
