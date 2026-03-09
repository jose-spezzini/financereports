import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/ui/Button';

interface WaitlistProps {
    session?: any;
}

const Waitlist: React.FC<WaitlistProps> = ({ session }) => {

    const [spotsLeft, setSpotsLeft] = useState(10);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkWaitlist = async () => {
            const { count } = await supabase
                .from('waitlist')
                .select('*', { count: 'exact', head: true });

            const spots = Math.max(0, 10 - (count || 0));
            setSpotsLeft(spots);

            if (session?.user?.email) {
                const { data } = await supabase
                    .from('waitlist')
                    .select('id')
                    .eq('email', session.user.email)
                    .single();
                if (data) setAlreadyRegistered(true);
            }
            setLoading(false);
        };
        checkWaitlist();
    }, [session]);

    const handleJoinWaitlist = async () => {
        setSubmitting(true);
        setError('');

        const { error } = await supabase
            .from('waitlist')
            .insert({
                email: session?.user?.email,
                source: 'finance_reports_plus',
                interested_features: ['history', 'cloud_storage', 'comparison']
            });

        if (error) {
            if (error.code === '23505') {
                setAlreadyRegistered(true);
            } else {
                setError('Ocurrió un error. Intentá de nuevo.');
            }
        } else {
            setSuccess(true);
            setSpotsLeft(prev => Math.max(0, prev - 1));
        }
        setSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Cargando...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">

                <div className="text-5xl mb-4">🎁</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Finance Reports Plus
                </h1>
                <p className="text-gray-500 mb-6">
                    Historial de reportes, comparación de períodos y dashboard acumulado
                </p>

                {spotsLeft > 0 ? (
                    <div className="bg-blue-50 rounded-xl p-4 mb-8">
                        <p className="text-blue-700 font-semibold text-lg">
                            🎉 {spotsLeft} lugar{spotsLeft !== 1 ? 'es' : ''} gratis disponible{spotsLeft !== 1 ? 's' : ''}
                        </p>
                        <p className="text-blue-500 text-sm mt-1">
                            Los primeros 10 usuarios obtienen 1 mes gratis
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                        <p className="text-gray-600 font-semibold">
                            Los 10 lugares gratuitos ya fueron tomados
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            Anotate igual — te avisamos cuando lancemos
                        </p>
                    </div>
                )}

                {success ? (
                    <div className="bg-green-50 rounded-xl p-6">
                        <div className="text-4xl mb-3">✅</div>
                        <h2 className="text-xl font-bold text-green-700 mb-2">¡Estás anotado!</h2>
                        <p className="text-green-600 text-sm">
                            Te vamos a avisar a <strong>{session?.user?.email}</strong> cuando el Plus esté disponible.
                        </p>
                    </div>
                ) : alreadyRegistered ? (
                    <div className="bg-blue-50 rounded-xl p-6">
                        <div className="text-4xl mb-3">👍</div>
                        <h2 className="text-xl font-bold text-blue-700 mb-2">¡Ya estás en la lista!</h2>
                        <p className="text-blue-600 text-sm">
                            Te avisamos a <strong>{session?.user?.email}</strong> cuando esté listo.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-sm mb-6">
                            Te avisaremos a <strong>{session?.user?.email}</strong> cuando esté disponible
                        </p>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <Button
                            className="w-full"
                            onClick={handleJoinWaitlist}
                            disabled={submitting}
                        >
                            {submitting ? 'Registrando...' : '🚀 Quiero acceso gratuito'}
                        </Button>
                    </>
                )}

                <p className="text-gray-400 text-xs mt-6">
                    Sin compromisos. Te avisamos cuando esté listo.
                </p>
            </div>
        </div>
    );
};

export default Waitlist;