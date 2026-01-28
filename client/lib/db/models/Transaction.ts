import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    _id: mongoose.Types.ObjectId;
    accountId: mongoose.Types.ObjectId;
    userId: string;

    // Core transaction data
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    narration: string;
    transactionDate: Date;
    valueDate?: Date;
    reference?: string;

    // AI-populated fields
    category?: 'FOOD' | 'SHOPPING' | 'TRANSPORT' | 'BILLS' | 'ENTERTAINMENT' | 'SUBSCRIPTIONS' | 'TRANSFERS' | 'INCOME' | 'INVESTMENTS' | 'OTHER';
    merchant?: string;
    merchantLogo?: string;
    sentiment?: 'ESSENTIAL' | 'DISCRETIONARY' | 'SAVINGS';

    // User corrections (for learning)
    userCategory?: string;
    userMerchant?: string;

    // Original data from AA
    rawData?: Record<string, unknown>;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        accountId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
        userId: { type: String, required: true, index: true },

        amount: { type: Number, required: true },
        type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
        narration: { type: String, required: true },
        transactionDate: { type: Date, required: true, index: true },
        valueDate: { type: Date },
        reference: { type: String },

        category: {
            type: String,
            enum: ['FOOD', 'SHOPPING', 'TRANSPORT', 'BILLS', 'ENTERTAINMENT', 'SUBSCRIPTIONS', 'TRANSFERS', 'INCOME', 'INVESTMENTS', 'OTHER'],
            index: true
        },
        merchant: { type: String, index: true },
        merchantLogo: { type: String },
        sentiment: { type: String, enum: ['ESSENTIAL', 'DISCRETIONARY', 'SAVINGS'] },

        userCategory: { type: String },
        userMerchant: { type: String },

        rawData: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Compound indexes for common queries
TransactionSchema.index({ userId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ accountId: 1, transactionDate: -1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
