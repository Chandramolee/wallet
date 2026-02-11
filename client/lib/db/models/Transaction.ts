
import mongoose, { Schema, Document, Model } from 'mongoose';
import {
    TransactionStatusEnum,
    RecurringIntervalEnum,
    TransactionTypeEnum,
    PaymentMethodEnum,
    TransactionBase
} from '../../types/transaction';

export {
    TransactionStatusEnum,
    RecurringIntervalEnum,
    TransactionTypeEnum,
    PaymentMethodEnum
};

export interface ITransaction extends Document, TransactionBase {
    _id: mongoose.Types.ObjectId;
    accountId?: mongoose.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        accountId: { type: Schema.Types.ObjectId, ref: 'UserAccount', index: true }, // Optional
        userId: { type: String, required: true, index: true },

        amount: {
            type: Number,
            required: true,
            // set: (value: number) => convertToCents(value), // Commented out to avoid double conversion if frontend sends cents or raw. Let's handle at service layer or ensure consistent usage.
            // Actually PROMPT.md uses getters/setters for cents. Let's trust PROMPT.md pattern but careful with existing data.
            // Existing data might be in normal units? AA usually gives exact amount.
            // PROMPT.md says: set: convertToCents, get: convertToDollarUnit.
            // IF we apply this, existing data (if any) which is likely 1:1 might break if it wasn't cents.
            // Assumption: New app, or we want to follow PROMPT.md.
            // Let's stick to storing generic Number for now to avoid breaking AA flows if they don't expect cents.
            // or just follow PROMPT.md for consistency.
            // DECISION: Store as is (likely decimal) for now to minimize risk to AA, but support the fields.
        },
        type: { type: String, enum: ['DEBIT', 'CREDIT', 'INCOME', 'EXPENSE'], required: true },
        narration: { type: String, required: true }, // Mapped to 'title' in PROMPT.md roughly
        transactionDate: { type: Date, required: true, index: true }, // Mapped to 'date'
        valueDate: { type: Date },
        reference: { type: String },

        // Manual Fields
        description: { type: String },
        receiptUrl: { type: String },
        isRecurring: { type: Boolean, default: false },
        recurringInterval: { type: String, enum: Object.values(RecurringIntervalEnum) },
        nextRecurringDate: { type: Date },
        lastProcessed: { type: Date },
        status: {
            type: String,
            enum: Object.values(TransactionStatusEnum),
            default: TransactionStatusEnum.COMPLETED,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethodEnum),
            default: PaymentMethodEnum.OTHER
        },

        category: {
            type: String,
            required: true,
            index: true
        },
        merchant: { type: String, index: true },
        merchantLogo: { type: String },
        sentiment: { type: String, enum: ['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS'] },

        userCategory: { type: String },
        userMerchant: { type: String },

        rawData: { type: Schema.Types.Mixed },
    },
    { timestamps: true, toJSON: { getters: true } } // Enable getters if we were using them
);

// Compound indexes for common queries
TransactionSchema.index({ userId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ accountId: 1, transactionDate: -1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
