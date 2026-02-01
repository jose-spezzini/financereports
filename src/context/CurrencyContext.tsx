import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Currency = 'USD' | 'BRL' | 'PYG' | 'ARS';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    exchangeRates: Record<string, number>;
    convert: (amount: number) => number;
    format: (amount: number) => string;
    availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const [currency, setCurrency] = useState<Currency>('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    // Fetch exchange rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Using open.er-api.com for free rates (base USD)
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();
                if (data && data.rates) {
                    setExchangeRates(data.rates);
                }
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
                // Fallback rates if API fails
                setExchangeRates({
                    USD: 1,
                    BRL: 5.0,
                    PYG: 7500,
                    ARS: 1000 // Very volatile, but better than nothing as fallback
                });
            }
        };

        fetchRates();
    }, []);

    // Update currency based on language
    useEffect(() => {
        if (i18n.language === 'pt') {
            setCurrency('BRL');
        } else if (i18n.language === 'es' || i18n.language === 'en') {
            // Default to USD, but user can change it later if they want (handled in UI)
            // Ideally we only force it if it's currently something that doesn't make sense, 
            // but the requirement says: "If language is portuguese -> Reales. If English/Spanish -> Dollars"
            // So we strictly enforce this on language change.
            setCurrency('USD');
        }
    }, [i18n.language]);

    const convert = (amount: number): number => {
        if (!exchangeRates[currency]) return amount;
        return amount * exchangeRates[currency];
    };

    const format = (amount: number): string => {
        const converted = convert(amount);
        return new Intl.NumberFormat(i18n.language === 'es' ? 'es-PY' : i18n.language, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(converted);
    };

    const availableCurrencies: Currency[] = ['USD', 'BRL', 'PYG', 'ARS'];

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, convert, format, availableCurrencies }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
