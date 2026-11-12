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

type CountedItemCsvIngestJobData = {
    process_id: number;
    file_id: number;
};

const COUNTED_ITEM_CSV_INGEST_QUEUE = 'data_ingestion_counted_item_csv_ingest';
const COUNTED_ITEM_CSV_INGEST_JOB =
    'file_ingest_protocol_counted_item_csv_ingest_data';

@Processor(COUNTED_ITEM_CSV_INGEST_QUEUE)
export class CountedItemCsvIngestWorker extends WorkerHost {
    constructor(
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {
        super();
    }

    async process(job: Job<CountedItemCsvIngestJobData>): Promise<void> {
        if (job.name !== COUNTED_ITEM_CSV_INGEST_JOB) {
            return;
        }

        const updateProcessStatusForJob = bindUpdateProcessStatus({
            dataSource: this.dataSource,
        });

        await runWithProcessStatus({
            job: job,
            task: this.runCountedItemCsvIngest.bind(this),
            updateProcessStatus: updateProcessStatusForJob,
            runningStatus: PROCESS_STATUS.RUNNING,
            successStatus: PROCESS_STATUS.SUCCESS,
            failedStatus: PROCESS_STATUS.FAILED,
        });
    }

    private async runCountedItemCsvIngest(
        job: Job<CountedItemCsvIngestJobData>,
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
            entityName: 'worker',
            data: records,
        });

        return {
            file_id: fileId,
            file_name: readString(file, 'file_name'),
            ingested_record_count: Array.isArray(records) ? records.length : 1,
        };
    }
}

export { COUNTED_ITEM_CSV_INGEST_QUEUE, COUNTED_ITEM_CSV_INGEST_JOB };
