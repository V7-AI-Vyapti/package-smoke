function normalizeSearch(search: string | null | undefined): string | null {
    const trimmed = search?.trim() ?? '';
    if (trimmed.length === 0) {
        return null;
    }
    return trimmed;
}

export { normalizeSearch };
