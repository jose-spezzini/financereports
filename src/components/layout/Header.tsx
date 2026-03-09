import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const Header: React.FC = () => {
    const homeUrl = import.meta.env.PROD ? 'https://spezzinisolutions.com' : 'http://localhost:5173';

    return (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <a href={homeUrl} className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Home
                        </a>
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">FinanceReports</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;