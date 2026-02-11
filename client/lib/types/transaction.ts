
export enum TransactionStatusEnum {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export enum RecurringIntervalEnum {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export enum TransactionTypeEnum {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
}

export enum PaymentMethodEnum {
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_PAYMENT = "MOBILE_PAYMENT",
    AUTO_DEBIT = "AUTO_DEBIT",
    CASH = "CASH",
    OTHER = "OTHER",
}

export interface TransactionBase {
    id?: string;
    userId: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT' | 'INCOME' | 'EXPENSE';
    narration: string;
    transactionDate: Date;
    valueDate?: Date;
    reference?: string;
    title?: string;
    description?: string;
    receiptUrl?: string;
    isRecurring: boolean;
    recurringInterval?: keyof typeof RecurringIntervalEnum;
    nextRecurringDate?: Date;
    lastProcessed?: Date;
    status: keyof typeof TransactionStatusEnum;
    paymentMethod: keyof typeof PaymentMethodEnum;
    category: string;
    merchant?: string;
    merchantLogo?: string;
    sentiment?: 'ESSENTIAL' | 'DISCRETIONARY' | 'SAVINGS';
    userCategory?: string;
    userMerchant?: string;
    rawData?: Record<string, unknown>;
}
