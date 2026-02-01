import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API
        setTimeout(() => {
            setIsLoading(false);
            navigate('/payment');
        }, 1500);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full p-8 mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
                        >
                            {isLogin ? 'Regístrate' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>

                <div className="space-y-4">
                    <Button variant="outline" className="w-full" leftIcon={<Github className="w-5 h-5" />}>
                        Continuar con Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">O continúa con email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                placeholder="Nombre completo"
                                required
                            // leftIcon={<User .../>} - Input component needs update for icons, skipping for now
                            />
                        )}
                        <Input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            required
                        />
                        {!isLogin && (
                            <Input
                                type="password"
                                placeholder="Confirmar contraseña"
                                required
                            />
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            {isLogin ? 'Iniciar Sesión' : 'Suscribirse Ahora'}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default Register;
