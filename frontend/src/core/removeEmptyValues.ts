export const removeEmptyValues = (object: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
        if (value === null || value === undefined) {
            continue;
        }
        if (typeof value === "string" && value.trim() === "") {
            continue;
        }
        result[key] = value;
    }
    return result;
};