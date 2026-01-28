import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAccount extends Document {
    _id: mongoose.Types.ObjectId;
    userId: string;

    // Bank account details
    accountNumber: string;
    maskedAccountNumber: string;
    bankName: string;
    accountType: 'SAVINGS' | 'CURRENT' | 'DEPOSIT' | 'CREDIT_CARD' | 'OTHER';
    ifscCode?: string;

    // Balance info
    balance: number;
    currency: string;
    lastUpdated: Date;

    // AA consent info
    consentId?: mongoose.Types.ObjectId;
    fipId?: string;
    linkedVia: 'SETU_AA' | 'MOCK';
    linkedAt: Date;

    // Status
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const UserAccountSchema = new Schema<IUserAccount>(
    {
        userId: { type: String, required: true, index: true },

        accountNumber: { type: String, required: true },
        maskedAccountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
        accountType: {
            type: String,
            enum: ['SAVINGS', 'CURRENT', 'DEPOSIT', 'CREDIT_CARD', 'OTHER'],
            default: 'SAVINGS'
        },
        ifscCode: { type: String },

        balance: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        lastUpdated: { type: Date, default: Date.now },

        consentId: { type: Schema.Types.ObjectId, ref: 'Consent' },
        fipId: { type: String },
        linkedVia: { type: String, enum: ['SETU_AA', 'MOCK'], required: true },
        linkedAt: { type: Date, required: true },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index
UserAccountSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

const UserAccount: Model<IUserAccount> = mongoose.models.UserAccount || mongoose.model<IUserAccount>('UserAccount', UserAccountSchema);

export default UserAccount;
