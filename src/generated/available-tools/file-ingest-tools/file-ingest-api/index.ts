import { TriggerAssetCsvIngestController } from '@available-tools/file-ingest-tools/file-ingest-api/trigger-asset-csv-ingest-2.controller';
import { TriggerAssignmentCsvIngestController } from '@available-tools/file-ingest-tools/file-ingest-api/trigger-assignment-csv-ingest-4.controller';
import { TriggerCountedItemCsvIngestController } from '@available-tools/file-ingest-tools/file-ingest-api/trigger-counted-item-csv-ingest-3.controller';
import { TriggerEmployeeCsvIngestController } from '@available-tools/file-ingest-tools/file-ingest-api/trigger-employee-csv-ingest-1.controller';

export const fileIngestApiControllers = [
    TriggerAssetCsvIngestController,
    TriggerAssignmentCsvIngestController,
    TriggerCountedItemCsvIngestController,
    TriggerEmployeeCsvIngestController,
];
