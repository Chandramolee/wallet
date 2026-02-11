
import mongoose, { Document, Model, Schema } from "mongoose";

export enum ReportFrequencyEnum {
    MONTHLY = "MONTHLY",
}

export interface IReportSetting extends Document {
    userId: string;
    frequency: ReportFrequencyEnum;
    isEnabled: boolean;
    nextReportDate?: Date;
    lastSentDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const reportSettingSchema = new Schema<IReportSetting>(
    {
        userId: {
            type: String, // Changed to String for Clerk ID
            required: true,
            index: true,
            unique: true, // Ensure one setting per user
        },
        frequency: {
            type: String,
            enum: Object.values(ReportFrequencyEnum),
            default: ReportFrequencyEnum.MONTHLY,
        },
        isEnabled: {
            type: Boolean,
            default: false,
        },
        nextReportDate: {
            type: Date,
        },
        lastSentDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const ReportSetting: Model<IReportSetting> = mongoose.models.ReportSetting || mongoose.model<IReportSetting>("ReportSetting", reportSettingSchema);

export default ReportSetting;
