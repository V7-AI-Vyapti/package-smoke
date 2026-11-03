const GENERATED_CATALOG_RESOURCES = [
    { resource: 'batch', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'district', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'organisation', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'state', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'worker', actions: ['create', 'delete', 'list', 'update', 'view'] },
] as const;

export { GENERATED_CATALOG_RESOURCES };
