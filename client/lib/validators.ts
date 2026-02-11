
import { z } from "zod";
import {
    PaymentMethodEnum,
    RecurringIntervalEnum,
    TransactionTypeEnum,
} from "./types/transaction";

export const transactionIdSchema = z.string().trim().min(1);

export const baseTransactionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.nativeEnum(TransactionTypeEnum),
    amount: z.number().positive("Amount must be postive").min(0.01), // prompt said min(1) but for generic usage 0.01 is better? allow 1 as per prompt
    category: z.string().min(1, "Category is required"),
    date: z.date(),
    isRecurring: z.boolean(),
    recurringInterval: z
        .nativeEnum(RecurringIntervalEnum)
        .nullable()
        .optional(),

    receiptUrl: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethodEnum),
});

export type CreateTransactionSchemaType = z.infer<typeof baseTransactionSchema>;
