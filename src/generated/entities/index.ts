import { buildEntitySchema } from '@vyapti/core';
import { Batch } from './batch.entity';
import { District } from './district.entity';
import { Organisation } from './organisation.entity';
import { State } from './state.entity';
import { Worker } from './worker.entity';

export const entitySchemas = [
    buildEntitySchema(Batch),
    buildEntitySchema(District),
    buildEntitySchema(Organisation),
    buildEntitySchema(State),
    buildEntitySchema(Worker),
];
