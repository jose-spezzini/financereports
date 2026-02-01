import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, type Currency } from '../context/CurrencyContext';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const { currency, setCurrency, availableCurrencies } = useCurrency();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center space-x-4">
            {/* Currency Selector - Logic: If in USD (which happens directly on EN/ES), allow changing to others. 
                But also, generally allowing changing currency is good UX. 
                The prompt specifically mentions: "if it stays in dollars give the option to change..." 
                So we simply show the currency selector always or conditionally. 
                Let's show it next to language selector for better UX. 
            */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md px-2 py-1">
                <span className="text-gray-500 font-bold text-xs">{currency}</span>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer w-full"
                >
                    {availableCurrencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                    ))}
                </select>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
