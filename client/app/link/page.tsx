'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Wallet,
    Smartphone,
    Shield,
    CheckCircle2,
    ArrowRight,
    Building2,
    ChevronRight,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const POPULAR_BANKS = [
    { name: 'HDFC Bank', logo: 'H', color: 'bg-blue-600' },
    { name: 'ICICI Bank', logo: 'I', color: 'bg-orange-600' },
    { name: 'SBI', logo: 'S', color: 'bg-blue-800' },
    { name: 'Axis Bank', logo: 'A', color: 'bg-pink-600' },
    { name: 'Kotak', logo: 'K', color: 'bg-red-600' },
    { name: 'Yes Bank', logo: 'Y', color: 'bg-blue-500' },
];

export default function LinkBankPage() {
    const [mobile, setMobile] = useState('');
    const [step, setStep] = useState<'mobile' | 'banks' | 'connecting'>('mobile');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    const handleSubmitMobile = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobile.length === 10) {
            setStep('banks');
        }
    };

    const handleSelectBank = (bankName: string) => {
        setSelectedBank(bankName);
        setStep('connecting');
        // Simulate connection
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-foreground">Fold</span>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost">Skip for now</Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-xl px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Step: Mobile Number */}
                    {step === 'mobile' && (
                        <>
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                                    <Smartphone className="h-8 w-8 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-semibold text-foreground">Connect your Bank</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Enter your mobile number linked with your bank account
                                </p>
                            </div>

                            <Card className="border-border">
                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmitMobile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number</Label>
                                            <div className="flex">
                                                <div className="flex items-center justify-center px-4 border border-r-0 border-border rounded-l-lg bg-slate-50 text-muted-foreground">
                                                    +91
                                                </div>
                                                <Input
                                                    id="mobile"
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    className="rounded-l-none"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={mobile.length !== 10}
                                        >
                                            Continue
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {[
                                    { icon: Shield, text: 'Bank-grade encryption' },
                                    { icon: Lock, text: 'RBI regulated' },
                                    { icon: CheckCircle2, text: 'Read-only access' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                            <item.icon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Step: Select Bank */}
                    {step === 'banks' && (
                        <>
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-semibold text-foreground">Select your Bank</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Choose the bank account you want to connect
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {POPULAR_BANKS.map((bank, i) => (
                                    <motion.div
                                        key={bank.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card
                                            className="border-border cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                                            onClick={() => handleSelectBank(bank.name)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bank.color} text-white font-bold text-lg`}>
                                                        {bank.logo}
                                                    </div>
                                                    <span className="font-medium text-foreground">{bank.name}</span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep('mobile')}
                            >
                                ← Back
                            </Button>
                        </>
                    )}

                    {/* Step: Connecting */}
                    {step === 'connecting' && (
                        <div className="text-center py-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"
                            >
                                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                            </motion.div>
                            <h1 className="text-2xl font-semibold text-foreground">Connecting to {selectedBank}</h1>
                            <p className="mt-2 text-muted-foreground">
                                Please wait while we securely connect your account...
                            </p>
                        </div>
                    )}

                    {/* Info section */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Powered by{' '}
                            <a href="https://setu.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Setu Account Aggregator
                            </a>
                        </p>
                        <p className="mt-1">
                            Your data is never stored on our servers
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
