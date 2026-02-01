import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Payment: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate Payment Processing
        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Suscripción Exitosa!</h2>
                    <p className="text-gray-600 mb-6">
                        Ahora tienes acceso completo a las funciones de FinanceReports Plus.
                    </p>
                    <Button onClick={() => navigate('/download-template')} className="w-full">
                        Comenzar a usar
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Order Summary */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Resumen de tu orden</h2>
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium text-gray-900">Plan Plus Mensual</span>
                            <span className="font-bold text-gray-900">$7.00/mes</span>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-6">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Almacenamiento nube
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Soporte prioritario
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Historial de reportes
                            </li>
                        </ul>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg">Total hoy</span>
                            <span className="font-bold text-lg text-blue-600">$7.00 USD</span>
                        </div>
                    </Card>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Shield className="w-4 h-4" />
                        Pagos encriptados y seguros
                    </div>
                </div>

                {/* Payment Form */}
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Información de Pago</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Nombre en la tarjeta" placeholder="Juan Pérez" required />
                        <Input label="Número de tarjeta" placeholder="0000 0000 0000 0000" leftIcon={<CreditCard className="w-5 h-5" />} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Fecha Exp." placeholder="MM/YY" required />
                            <Input label="CVC" placeholder="123" required />
                        </div>
                        <Input label="Código Postal" placeholder="12345" required />

                        <div className="flex items-start gap-2 mt-4">
                            <input type="checkbox" id="terms" className="mt-1" required />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                Acepto los términos y condiciones y la renovación automática mensual.
                            </label>
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading} leftIcon={<Lock className="w-4 h-4" />}>
                            Pagar y Suscribirse
                        </Button>
                    </form>
                </Card>

            </div>
        </div>
    );
};

export default Payment;
