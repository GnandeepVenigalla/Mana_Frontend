// Format currency utility
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
    if (amount === undefined || amount === null) amount = 0;

    // Create formatter based on currency
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
};
