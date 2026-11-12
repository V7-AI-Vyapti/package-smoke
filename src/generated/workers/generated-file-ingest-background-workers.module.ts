import { Module } from '@nestjs/common';
import { FileIngestToolsModule } from '@available-tools/file-ingest-tools/file-ingest-tools.module';
import { WorkerQueueInfrastructureModule } from '../../workers/worker-queue-infrastructure.module';

/**
 * File-ingest BullMQ processors (codegen):
 * - AssignmentCsvIngestWorker → available-tools/file-ingest-tools/file-ingest-worker/assignment-csv-ingest-4.worker.ts
 * - CountedItemCsvIngestWorker → available-tools/file-ingest-tools/file-ingest-worker/counted-item-csv-ingest-3.worker.ts
 * - AssetCsvIngestWorker → available-tools/file-ingest-tools/file-ingest-worker/asset-csv-ingest-2.worker.ts
 * - EmployeeCsvIngestWorker → available-tools/file-ingest-tools/file-ingest-worker/employee-csv-ingest-1.worker.ts
 */

@Module({
    imports: [WorkerQueueInfrastructureModule, FileIngestToolsModule],
    providers: [],
    exports: [FileIngestToolsModule],
})
export class GeneratedFileIngestBackgroundWorkersModule {}
