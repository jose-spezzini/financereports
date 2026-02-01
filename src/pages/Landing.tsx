import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Landing: React.FC = () => {
    const { t } = useTranslation();

    const plans = [
        {
            name: t('landing.plans.free'),
            price: '$0',
            features: [
                t('landing.features.basic'),
                t('landing.features.download'),
                t('landing.features.pdf'),
                t('landing.features.noStorage')
            ],
            buttonText: t('landing.getStarted'),
            link: '/download-template',
            variant: 'outline' as const
        },
        {
            name: t('landing.plans.plus'),
            price: '$7',
            period: t('landing.period.monthly'),
            features: [
                t('landing.features.allFree'),
                t('landing.features.cloud'),
                t('landing.features.history'),
                t('landing.features.priority')
            ],
            buttonText: t('landing.subscribe'),
            link: '/register',
            variant: 'primary' as const,
            popular: true
        },
        {
            name: t('landing.plans.enterprise'),
            price: t('landing.contact'),
            features: [
                t('landing.features.custom'),
                t('landing.features.api'),
                t('landing.features.dedicated')
            ],
            buttonText: t('landing.comingSoon'),
            link: '#',
            variant: 'secondary' as const,
            disabled: true
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[600px] flex items-center">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        {t('landing.title')}
                    </h1>
                    <p className="text-lg leading-8 text-gray-600 mb-10">
                        {t('landing.subtitle')}
                    </p>
                    <div className="flex items-center justify-center gap-x-6">
                        <Link to="/download-template">
                            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                {t('landing.getStarted')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Choose the right plan for you
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={`flex flex-col p-8 ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : ''}`}>
                                <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                                <p className="mt-4 flex items-baseline gap-x-2">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                                    {plan.period && <span className="text-sm font-semibold leading-6 text-gray-600">{plan.period}</span>}
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <Link to={plan.link} className={`block ${plan.disabled ? 'pointer-events-none' : ''}`}>
                                        <Button
                                            variant={plan.variant}
                                            className="w-full"
                                            disabled={plan.disabled}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
