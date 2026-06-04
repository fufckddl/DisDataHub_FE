export function formatYyyymmdd(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
}

export function formatYyyymmddDaysAgo(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return formatYyyymmdd(date);
}
