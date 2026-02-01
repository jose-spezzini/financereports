import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const Header: React.FC = () => {

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">FinanceReports</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
