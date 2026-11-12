const GENERATED_CATALOG_RESOURCES = [
    { resource: 'asset_csv_ingest', actions: ['run'] },
    { resource: 'assignment_csv_ingest', actions: ['run'] },
    { resource: 'batch', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'counted_item_csv_ingest', actions: ['run'] },
    { resource: 'district', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'employee_csv_ingest', actions: ['run'] },
    { resource: 'organisation', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'state', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'worker', actions: ['create', 'delete', 'list', 'update', 'view'] },
] as const;

export { GENERATED_CATALOG_RESOURCES };
