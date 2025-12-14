'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/UI';
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '50 contact views per day',
            'Basic dashboard access',
            'Email support',
            'Daily credit reset',
            'Basic analytics'
        ],
        icon: Zap,
        color: 'from-zinc-400 to-zinc-600',
        buttonText: 'Current Plan',
        disabled: true
    },
    {
        name: 'Pro',
        price: '$29',
        period: 'per month',
        description: 'For growing businesses',
        features: [
            '500 contact views per day',
            'Advanced dashboard',
            'Priority email support',
            'Export to CSV',
            'Advanced analytics',
            'Custom branding',
            'API access'
        ],
        icon: Crown,
        color: 'from-blue-500 to-blue-700',
        buttonText: 'Upgrade to Pro',
        popular: true
    },
    {
        name: 'Enterprise',
        price: '$99',
        period: 'per month',
        description: 'For large organizations',
        features: [
            'Unlimited contact views',
            'Premium dashboard',
            '24/7 phone support',
            'Unlimited exports',
            'Custom integrations',
            'Dedicated account manager',
            'SLA guarantee',
            'Custom training'
        ],
        icon: Rocket,
        color: 'from-purple-500 to-purple-700',
        buttonText: 'Contact Sales'
    }
];

export default function Upgrade() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleUpgrade = (planName: string) => {
        // TODO: Implement payment integration (Stripe, etc.)
        alert(`Upgrading to ${planName} plan! Payment integration coming soon.`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    Unlock more features and grow your business with our premium plans
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className={`relative w-16 h-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${billingCycle === 'yearly'
                            ? 'bg-gradient-to-r from-green-400 to-green-600 dark:from-emerald-500 dark:to-emerald-700'
                            : 'bg-zinc-200 dark:bg-zinc-700'
                            }`}
                    >
                        <div className={`absolute top-1 left-1 w-7 h-7 bg-white dark:bg-zinc-100 rounded-full shadow-md transform transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`} />
                    </button>
                    <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                        Yearly
                        <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                            Save 20%
                        </span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const yearlyPrice = plan.price === '$0' ? '$0' : `$${Math.round(parseInt(plan.price.slice(1)) * 12 * 0.8)}`;
                    const displayPrice = billingCycle === 'yearly' ? yearlyPrice : plan.price;
                    const displayPeriod = billingCycle === 'yearly' ? 'per year' : plan.period;

                    return (
                        <div
                            key={plan.name}
                            className={`relative pt-8 pb-6 px-6 rounded-3xl border ${plan.popular
                                ? 'bg-white dark:bg-zinc-900 border-blue-500/50 dark:border-blue-500/50 shadow-xl shadow-blue-500/10 scale-105 z-10'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
                                } transition-all duration-300 hover:shadow-xl`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 -right-3 z-10">
                                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center space-y-3">
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg`}>
                                    <Icon size={28} className="text-white" />
                                </div>

                                {/* Plan Name */}
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {plan.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {plan.description}
                                </p>

                                {/* Price */}
                                <div className="py-3">
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                                            {displayPrice}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                        {displayPeriod}
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={plan.disabled}
                                    className={`w-full py-3 px-5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-4 ${plan.disabled
                                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:scale-95 shadow-lg shadow-blue-500/25'
                                        }`}
                                >
                                    {plan.buttonText}
                                    {!plan.disabled && <ArrowRight size={18} />}
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-3">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-left">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                                <Check size={12} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FAQ Section */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-16">
                <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            Can I change plans later?
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            What payment methods do you accept?
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            Is there a free trial?
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            The Free plan is available forever. Pro and Enterprise plans offer a 14-day free trial.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                            Can I cancel anytime?
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Absolutely! Cancel anytime with no questions asked. You'll retain access until the end of your billing period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
