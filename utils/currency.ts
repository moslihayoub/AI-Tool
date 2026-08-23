export const toCents = (val: string | number): number => {
    return Math.round(parseFloat(String(val)) * 100);
};

export const formatCents = (cents: number): string => {
    return (cents / 100).toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};
