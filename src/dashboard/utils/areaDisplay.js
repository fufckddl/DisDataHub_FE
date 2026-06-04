function normalizeText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function getAreaDisplayName(area, fallback = "전국") {
    const name = normalizeText(area?.name);
    if (name) {
        return name;
    }

    const fullName = normalizeText(area?.fullName);
    if (fullName) {
        return fullName.split(" ").pop() ?? fullName;
    }

    return fallback;
}

function getParentAreaPrefix(area) {
    const fullName = normalizeText(area?.fullName);
    const displayName = getAreaDisplayName(area, "");

    if (!fullName || !displayName || fullName === displayName || !fullName.endsWith(displayName)) {
        return "";
    }

    return fullName.slice(0, -displayName.length).trim();
}

export function formatAreaScopedLabel(label, area, fallback = "-") {
    const text = normalizeText(label);
    if (!text) {
        return fallback;
    }

    if (!area) {
        return text;
    }

    const fullName = normalizeText(area.fullName);
    const displayName = getAreaDisplayName(area, "");
    const parentPrefix = getParentAreaPrefix(area);

    if (fullName && displayName) {
        if (text === fullName) {
            return displayName;
        }

        if (fullName.startsWith(`${text} `)) {
            return text.split(" ").pop() ?? text;
        }

        if (text.startsWith(`${fullName} `)) {
            return `${displayName}${text.slice(fullName.length)}`;
        }

        if (text.includes(fullName)) {
            return text.replaceAll(fullName, displayName);
        }
    }

    if (parentPrefix && text.startsWith(`${parentPrefix} `)) {
        return text.slice(parentPrefix.length).trim();
    }

    return text;
}
