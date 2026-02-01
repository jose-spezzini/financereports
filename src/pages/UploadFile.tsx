import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { parseAndValidateExcel } from '../utils/excelParser';
import type { ValidationError, Transaction } from '../utils/excelParser';

const UploadFile: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [validData, setValidData] = useState<Transaction[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsLoading(true);
        setErrors([]);
        setValidData([]);

        // Check extension
        if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
            setErrors([{ row: 0, column: 'File', message: t('upload.invalidExtension') }]);
            setIsLoading(false);
            return;
        }

        try {
            const { data, errors: parseErrors } = await parseAndValidateExcel(selectedFile);
            setErrors(parseErrors);
            setValidData(data);
        } catch (err) {
            console.error(err);
            setErrors([{ row: 0, column: 'Processing', message: t('upload.unknownError') }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleAnalyze = () => {
        if (validData.length > 0) {
            navigate('/dashboard', { state: { data: validData } });
        }
    };

    const clearFile = () => {
        setFile(null);
        setErrors([]);
        setValidData([]);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('upload.title')}</h1>
                <p className="text-lg text-gray-600">{t('upload.subtitle')}</p>
            </div>

            <div className="max-w-xl mx-auto">
                {!file ? (
                    <div
                        className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                        />
                        <div className="flex flex-col items-center">
                            <div className="bg-blue-100 p-4 rounded-full mb-4">
                                <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">{t('upload.dragDrop')}</p>
                            <p className="text-sm text-gray-500 mt-2">{t('upload.clickToBrowse')}</p>
                            <p className="text-xs text-gray-400 mt-4">{t('upload.support')}</p>
                        </div>
                    </div>
                ) : (
                    <Card className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-700" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={clearFile} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isLoading && (
                            <div className="mt-6 text-center text-gray-500">{t('common.processing')}</div>
                        )}

                        {!isLoading && errors.length > 0 && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{t('upload.errorsFound', { count: errors.length })}</span>
                                </div>
                                <ul className="space-y-1 text-sm text-red-700">
                                    {errors.map((err, i) => (
                                        <li key={i}>
                                            {t('upload.row')} {err.row}, {t('upload.column')} {err.column}: {t(err.message, err.message)}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4">
                                    <Button variant="secondary" size="sm" onClick={clearFile}>{t('common.tryAnother')}</Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && errors.length === 0 && validData.length > 0 && (
                            <div className="mt-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">{t('common.fileValid', { count: validData.length })}</span>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleAnalyze}
                                >
                                    {t('common.analyze')}
                                </Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default UploadFile;
