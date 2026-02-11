
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { baseTransactionSchema, CreateTransactionSchemaType } from '@/lib/validators';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Loader2 } from 'lucide-react';
import { TransactionTypeEnum, PaymentMethodEnum, TransactionBase, RecurringIntervalEnum } from '@/lib/types/transaction';
import { toast } from 'sonner';

const CATEGORIES = [
    'FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT',
    'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER'
];

interface EditTransactionDialogProps {
    transaction: TransactionBase | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onSuccess }: EditTransactionDialogProps) {
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

    useEffect(() => {
        if (transaction) {
            form.reset({
                title: transaction.title || transaction.narration || '',
                amount: transaction.amount,
                type: (transaction.type === 'INCOME' || transaction.type === 'CREDIT')
                    ? TransactionTypeEnum.INCOME
                    : TransactionTypeEnum.EXPENSE,
                category: transaction.category || 'OTHER',
                date: new Date(transaction.transactionDate),
                paymentMethod: (transaction.paymentMethod as PaymentMethodEnum) || PaymentMethodEnum.CASH,
                isRecurring: transaction.isRecurring || false,
                recurringInterval: (transaction.recurringInterval as RecurringIntervalEnum) || undefined,
            });
        }
    }, [transaction, form]);

    const onSubmit = async (data: CreateTransactionSchemaType) => {
        if (!transaction?.id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/transactions/${transaction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update transaction');

            toast.success('Transaction updated successfully');
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>

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
                                value={form.watch('type')}
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
                                value={form.watch('category')}
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
                                value={form.watch('date') ? new Date(form.watch('date')).toISOString().split('T')[0] : ''}
                                onChange={(e) => form.setValue('date', new Date(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                            onValueChange={(v) => form.setValue('paymentMethod', v as PaymentMethodEnum)}
                            value={form.watch('paymentMethod')}
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
                                Updating...
                            </>
                        ) : 'Update Transaction'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
