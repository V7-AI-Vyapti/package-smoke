import { Module } from '@nestjs/common';
import { GeneratedAccessPolicyModule } from '../../access-policy/access-policy.module';
import {
    CreateBatchController,
    CreateBatchService,
} from '@generated-crud/batch/create_batch.api';
import {
    CreateDistrictController,
    CreateDistrictService,
} from '@generated-crud/district/create_district.api';
import {
    CreateOrganisationController,
    CreateOrganisationService,
} from '@generated-crud/organisation/create_organisation.api';
import {
    CreateStateController,
    CreateStateService,
} from '@generated-crud/state/create_state.api';
import {
    CreateWorkerController,
    CreateWorkerService,
} from '@generated-crud/worker/create_worker.api';
import {
    DeleteBatchController,
    DeleteBatchService,
} from '@generated-crud/batch/delete_batch.api';
import {
    DeleteDistrictController,
    DeleteDistrictService,
} from '@generated-crud/district/delete_district.api';
import {
    DeleteOrganisationController,
    DeleteOrganisationService,
} from '@generated-crud/organisation/delete_organisation.api';
import {
    DeleteStateController,
    DeleteStateService,
} from '@generated-crud/state/delete_state.api';
import {
    DeleteWorkerController,
    DeleteWorkerService,
} from '@generated-crud/worker/delete_worker.api';
import {
    ListBatchController,
    ListBatchService,
} from '@generated-crud/batch/list_batch.api';
import {
    ListDistrictController,
    ListDistrictService,
} from '@generated-crud/district/list_district.api';
import {
    ListOrganisationController,
    ListOrganisationService,
} from '@generated-crud/organisation/list_organisation.api';
import {
    ListStateController,
    ListStateService,
} from '@generated-crud/state/list_state.api';
import {
    ListWorkerController,
    ListWorkerService,
} from '@generated-crud/worker/list_worker.api';
import {
    UpdateBatchController,
    UpdateBatchService,
} from '@generated-crud/batch/update_batch.api';
import {
    UpdateDistrictController,
    UpdateDistrictService,
} from '@generated-crud/district/update_district.api';
import {
    UpdateOrganisationController,
    UpdateOrganisationService,
} from '@generated-crud/organisation/update_organisation.api';
import {
    UpdateStateController,
    UpdateStateService,
} from '@generated-crud/state/update_state.api';
import {
    UpdateWorkerController,
    UpdateWorkerService,
} from '@generated-crud/worker/update_worker.api';
import {
    ViewBatchController,
    ViewBatchService,
} from '@generated-crud/batch/view_batch.api';
import {
    ViewDistrictController,
    ViewDistrictService,
} from '@generated-crud/district/view_district.api';
import {
    ViewOrganisationController,
    ViewOrganisationService,
} from '@generated-crud/organisation/view_organisation.api';
import {
    ViewStateController,
    ViewStateService,
} from '@generated-crud/state/view_state.api';
import {
    ViewWorkerController,
    ViewWorkerService,
} from '@generated-crud/worker/view_worker.api';

@Module({
    imports: [GeneratedAccessPolicyModule],
    controllers: [
        CreateBatchController,
        CreateDistrictController,
        CreateOrganisationController,
        CreateStateController,
        CreateWorkerController,
        DeleteBatchController,
        DeleteDistrictController,
        DeleteOrganisationController,
        DeleteStateController,
        DeleteWorkerController,
        ListBatchController,
        ListDistrictController,
        ListOrganisationController,
        ListStateController,
        ListWorkerController,
        UpdateBatchController,
        UpdateDistrictController,
        UpdateOrganisationController,
        UpdateStateController,
        UpdateWorkerController,
        ViewBatchController,
        ViewDistrictController,
        ViewOrganisationController,
        ViewStateController,
        ViewWorkerController,
    ],
    providers: [
        CreateBatchService,
        CreateDistrictService,
        CreateOrganisationService,
        CreateStateService,
        CreateWorkerService,
        DeleteBatchService,
        DeleteDistrictService,
        DeleteOrganisationService,
        DeleteStateService,
        DeleteWorkerService,
        ListBatchService,
        ListDistrictService,
        ListOrganisationService,
        ListStateService,
        ListWorkerService,
        UpdateBatchService,
        UpdateDistrictService,
        UpdateOrganisationService,
        UpdateStateService,
        UpdateWorkerService,
        ViewBatchService,
        ViewDistrictService,
        ViewOrganisationService,
        ViewStateService,
        ViewWorkerService,
    ],
})
export class GeneratedCrudApiModule {}
