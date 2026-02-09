'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/import/FileUpload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImportPage() {
    const [activeTab, setActiveTab] = useState('pdf');
    const [transactions, setTransactions] = useState<any[]>([]);

    // Manual Entry States
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [type, setType] = useState('DEBIT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUploadSuccess = (data: any[]) => {
        setTransactions(prev => [...data, ...prev]);
        // TODO: Trigger categorization pipeline for these new transactions
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/transactions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    amount: parseFloat(amount),
                    narration,
                    type,
                }),
            });

            if (!res.ok) throw new Error('Failed to create transaction');

            const data = await res.json();

            setTransactions(prev => [data.transaction, ...prev]);
            setAmount('');
            setNarration('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Manual entry error:', error);
            // Optional: show error toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="mx-auto max-w-4xl space-y-8">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Import Transactions</h1>
                        <p className="text-muted-foreground mt-2">
                            Upload bank statements or add expenses manually. AI will handle the rest.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="pdf" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="pdf">Upload PDF Statement</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pdf" className="space-y-6">
                        <FileUpload onUploadSuccess={handleUploadSuccess} />

                        {/* AI Process Explanation */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[
                                { title: '1. Extract', desc: 'Gemini Flash parses PDF text', icon: '📄' },
                                { title: '2. Categorize', desc: 'Claude Haiku tags expenses', icon: '🏷️' },
                                { title: '3. Insight', desc: 'Gemini Pro creates insights', icon: '✨' },
                            ].map((step, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-2xl mb-2">{step.icon}</div>
                                    <div className="font-medium text-sm text-foreground">{step.title}</div>
                                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="manual">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select value={type} onValueChange={setType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DEBIT">Expense (Debit)</SelectItem>
                                                    <SelectItem value="CREDIT">Income (Credit)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-8"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="narration">Description</Label>
                                        <Input
                                            id="narration"
                                            placeholder="e.g. Starbucks Coffee or Uber Ride"
                                            value={narration}
                                            onChange={(e) => setNarration(e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Sparkles className="h-3 w-3 text-blue-500" />
                                            AI will automatically categorize this
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : success ? (
                                            <Check className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4" />
                                        )}
                                        {isSubmitting ? 'Adding...' : success ? 'Added!' : 'Add Transaction'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Recent Imports Logic Preview */}
                {transactions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="font-semibold mb-4">Just Imported</h3>
                        <div className="bg-card rounded-xl border shadow-sm divide-y">
                            {transactions.slice(0, 5).map((tx, i) => (
                                <div key={i} className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{tx.narration}</div>
                                        <div className="text-xs text-muted-foreground">{tx.date}</div>
                                    </div>
                                    <div className={`font-mono font-medium ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-foreground'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
