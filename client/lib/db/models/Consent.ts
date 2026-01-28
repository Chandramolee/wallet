import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConsent extends Document {
    _id: mongoose.Types.ObjectId;
    userId: string;

    // Setu AA consent identifiers
    consentId: string;
    consentHandle: string;

    // Consent status
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | 'EXPIRED' | 'PAUSED';

    // Consent details
    fiTypes: string[];
    purpose: string;
    dataRange: {
        from: Date;
        to: Date;
    };
    fetchType: 'ONETIME' | 'PERIODIC';

    // Data session
    dataSessionId?: string;
    dataSessionStatus?: 'PENDING' | 'READY' | 'EXPIRED' | 'FAILED';
    lastDataFetch?: Date;

    // Expiry
    consentExpiry: Date;

    // VUA
    vua: string; // e.g., "+919876543210@setu"

    createdAt: Date;
    updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
    {
        userId: { type: String, required: true, index: true },

        consentId: { type: String, required: true, unique: true },
        consentHandle: { type: String, required: true },

        status: {
            type: String,
            enum: ['PENDING', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED', 'PAUSED'],
            default: 'PENDING',
            index: true
        },

        fiTypes: [{ type: String }],
        purpose: { type: String },
        dataRange: {
            from: { type: Date },
            to: { type: Date },
        },
        fetchType: { type: String, enum: ['ONETIME', 'PERIODIC'], default: 'ONETIME' },

        dataSessionId: { type: String, index: true },
        dataSessionStatus: { type: String, enum: ['PENDING', 'READY', 'EXPIRED', 'FAILED'] },
        lastDataFetch: { type: Date },

        consentExpiry: { type: Date, required: true },

        vua: { type: String, required: true },
    },
    { timestamps: true }
);

const Consent: Model<IConsent> = mongoose.models.Consent || mongoose.model<IConsent>('Consent', ConsentSchema);

export default Consent;
