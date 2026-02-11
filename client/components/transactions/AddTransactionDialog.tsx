
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { baseTransactionSchema, CreateTransactionSchemaType } from '@/lib/validators';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Camera, Loader2, Upload } from 'lucide-react';
import { TransactionTypeEnum, PaymentMethodEnum } from '@/lib/types/transaction';
import { toast } from 'sonner';

const CATEGORIES = [
    'FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT',
    'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER'
];

interface AddTransactionDialogProps {
    onSuccess?: () => void;
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(baseTransactionSchema),
        defaultValues: {
            title: '',
            amount: 0,
            type: TransactionTypeEnum.EXPENSE,
            category: 'OTHER',
            date: new Date(),
            paymentMethod: PaymentMethodEnum.CASH,
            isRecurring: false,
        },
    });

    const onSubmit = async (data: CreateTransactionSchemaType) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create transaction');

            toast.success('Transaction created successfully');
            setOpen(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
            });

            const response = await fetch('/api/ai/scan-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
            });

            if (!response.ok) throw new Error('Failed to scan receipt');

            const result = await response.json();
            const scanData = result.data;

            // Auto-fill form
            if (scanData) {
                form.setValue('title', scanData.title || '');
                form.setValue('amount', scanData.amount || 0);
                form.setValue('date', scanData.date ? new Date(scanData.date) : new Date());
                form.setValue('category', scanData.category?.toUpperCase() || 'OTHER');
                form.setValue('paymentMethod', scanData.paymentMethod || PaymentMethodEnum.CASH);
                toast.success('Receipt scanned successfully!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to scan receipt');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="receipt-upload"
                            disabled={isScanning}
                        />
                        <label
                            htmlFor="receipt-upload"
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            {isScanning ? (
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            ) : (
                                <Camera className="h-8 w-8 text-blue-600 mb-2" />
                            )}
                            <span className="text-sm font-medium">
                                {isScanning ? 'Scanning...' : 'Scan Receipt'}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">AI auto-fill</span>
                        </label>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Lunch with friends"
                            {...form.register('title')}
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                {...form.register('amount', { valueAsNumber: true })}
                            />
                            {form.formState.errors.amount && (
                                <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                onValueChange={(v) => form.setValue('type', v as TransactionTypeEnum)}
                                defaultValue={form.getValues('type')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TransactionTypeEnum.EXPENSE}>Expense</SelectItem>
                                    <SelectItem value={TransactionTypeEnum.INCOME}>Income</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                onValueChange={(v) => form.setValue('category', v)}
                                defaultValue={form.getValues('category')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                defaultValue={form.getValues('date').toISOString().split('T')[0]}
                                onChange={(e) => form.setValue('date', new Date(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                            onValueChange={(v) => form.setValue('paymentMethod', v as PaymentMethodEnum)}
                            defaultValue={form.getValues('paymentMethod')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(PaymentMethodEnum).map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : 'Add Transaction'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
