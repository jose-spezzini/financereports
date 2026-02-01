import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { downloadTemplate } from '../utils/excelGenerator';

const DownloadTemplate: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('landing.steps.title')}
                </h1>
                <p className="text-lg text-gray-600">
                    {t('landing.steps.subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-green-50 p-4 rounded-full mb-6">
                        <FileSpreadsheet className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-3">{t('landing.steps.download.title')}</h2>
                    <p className="text-gray-600 mb-8 flex-grow">
                        {t('landing.steps.download.desc')}
                    </p>
                    <Button
                        onClick={downloadTemplate}
                        size="lg"
                        className="w-full"
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        {t('landing.steps.download.button')}
                    </Button>
                </Card>

                <Card className="p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 p-4 rounded-full mb-6">
                        <Upload className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-3">{t('landing.steps.upload.title')}</h2>
                    <p className="text-gray-600 mb-8 flex-grow">
                        {t('landing.steps.upload.desc')}
                    </p>
                    <Link to="/upload" className="w-full">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            leftIcon={<Upload className="w-4 h-4" />}
                        >
                            {t('landing.steps.upload.button')}
                        </Button>
                    </Link>
                </Card>
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">{t('common.important')}</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    <li>{t('landing.steps.important.rule1')}</li>
                    <li>{t('landing.steps.important.rule2')}</li>
                    <li>{t('landing.steps.important.rule3')}</li>
                </ul>
            </div>
        </div>
    );
};

export default DownloadTemplate;
