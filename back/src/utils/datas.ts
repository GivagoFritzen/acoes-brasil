
export const isFutureBrDate = (value: string): boolean => {
    const parsedDate = parseBrDateString(value);
    if (!parsedDate) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return parsedDate.getTime() > today.getTime();
};

const parseBrDateString = (value: string): Date | null => {
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) {
        return null;
    }

    const [, day, month, year] = match;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (
        Number.isNaN(parsed.getTime())
        || parsed.getDate() !== Number(day)
        || parsed.getMonth() !== Number(month) - 1
        || parsed.getFullYear() !== Number(year)
    ) {
        return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
};