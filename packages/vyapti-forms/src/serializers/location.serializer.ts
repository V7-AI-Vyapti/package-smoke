import type { LocationView } from '../types/forms.types.js';
import { toIsoString } from './form.serializer.js';

type LocationResponse = {
    locationId: string;
    label: string;
    hint: string | null;
    formKey: string | null;
    form: LocationView['form'];
    updatedBy: string | null;
    updatedAt: string;
};

function serializeLocation(location: LocationView): LocationResponse {
    return {
        locationId: location.locationId,
        label: location.label,
        hint: location.hint,
        formKey: location.formKey,
        form: location.form,
        updatedBy: location.updatedBy,
        updatedAt: toIsoString(location.updatedAt),
    };
}

function serializeLocations(locations: LocationView[]): LocationResponse[] {
    const responses: LocationResponse[] = [];
    for (const location of locations) {
        responses.push(serializeLocation(location));
    }
    return responses;
}

export { serializeLocation, serializeLocations };
export type { LocationResponse };
