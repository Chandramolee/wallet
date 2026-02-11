
import mongoose, { Document, Model, Schema } from "mongoose";

export enum ReportStatusEnum {
    SENT = "SENT",
    PENDING = "PENDING",
    FAILED = "FAILED",
    NO_ACTIVITY = "NO_ACTIVITY",
}

export interface IReport extends Document {
    userId: string;
    period: string;
    sentDate: Date;
    status: ReportStatusEnum;
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    savingsRate: number;
    topSpendingCategories: Array<{ name: string; amount: number; percent: number }>;
    insights: string[];
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
    {
        userId: {
            type: String, // Changed to String to match existing Transaction model's userId type (Clerk ID)
            required: true,
            index: true,
        },
        period: {
            type: String,
            required: true,
        },
        sentDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ReportStatusEnum),
            default: ReportStatusEnum.PENDING,
        },
        totalIncome: Number,
        totalExpenses: Number,
        availableBalance: Number,
        savingsRate: Number,
        topSpendingCategories: [
            {
                name: String,
                amount: Number,
                percent: Number,
            },
        ],
        insights: [String],
    },
    {
        timestamps: true,
    }
);

// Prevent overwriting model if it already exists
const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);

export default Report;
