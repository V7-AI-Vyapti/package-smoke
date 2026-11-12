import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { fileIngestApiControllers } from '@available-tools/file-ingest-tools/file-ingest-api';
import {
    AssignmentCsvIngestWorker,
    ASSIGNMENT_CSV_INGEST_QUEUE,
} from '@available-tools/file-ingest-tools/file-ingest-worker/assignment-csv-ingest-4.worker';
import {
    CountedItemCsvIngestWorker,
    COUNTED_ITEM_CSV_INGEST_QUEUE,
} from '@available-tools/file-ingest-tools/file-ingest-worker/counted-item-csv-ingest-3.worker';
import {
    AssetCsvIngestWorker,
    ASSET_CSV_INGEST_QUEUE,
} from '@available-tools/file-ingest-tools/file-ingest-worker/asset-csv-ingest-2.worker';
import {
    EmployeeCsvIngestWorker,
    EMPLOYEE_CSV_INGEST_QUEUE,
} from '@available-tools/file-ingest-tools/file-ingest-worker/employee-csv-ingest-1.worker';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.QUEUE_REDIS_HOST ?? '127.0.0.1',
                port: Number.parseInt(
                    process.env.QUEUE_REDIS_PORT ?? '6379',
                    10,
                ),
                username: process.env.QUEUE_REDIS_USERNAME || undefined,
                password: process.env.QUEUE_REDIS_PASSWORD || undefined,
                db: Number.parseInt(process.env.QUEUE_REDIS_DB ?? '0', 10),
                maxRetriesPerRequest: null,
            },
        }),
        BullModule.registerQueue({ name: ASSIGNMENT_CSV_INGEST_QUEUE }),
        BullModule.registerQueue({ name: COUNTED_ITEM_CSV_INGEST_QUEUE }),
        BullModule.registerQueue({ name: ASSET_CSV_INGEST_QUEUE }),
        BullModule.registerQueue({ name: EMPLOYEE_CSV_INGEST_QUEUE }),
    ],
    controllers: [...fileIngestApiControllers],
    providers: [
        AssignmentCsvIngestWorker,
        CountedItemCsvIngestWorker,
        AssetCsvIngestWorker,
        EmployeeCsvIngestWorker,
    ],
    exports: [],
})
export class FileIngestToolsModule {}
