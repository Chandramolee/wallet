
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongoose';
import Report, { ReportStatusEnum } from '@/lib/db/models/Report';
import Transaction, { ITransaction, TransactionTypeEnum } from '@/lib/db/models/Transaction';
import { generateReportInsights } from '@/lib/ai/gemini';
import { startOfDay, endOfDay, format } from 'date-fns';
import { convertToDollarUnit } from '@/lib/utils';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            Report.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Report.countDocuments({ userId }),
        ]);

        return NextResponse.json({
            reports,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + reports.length < total,
            }
        });

    } catch (error) {
        console.error('Reports fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}

// Generate Report Endpoint (POST)
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { from, to } = body; // Expect from and to dates in body

        if (!from || !to) {
            return NextResponse.json({ error: 'Date range required' }, { status: 400 });
        }

        await connectDB();

        const fromDate = startOfDay(new Date(from));
        const toDate = endOfDay(new Date(to));

        // Use Aggregation Pipeline from PROMPT.md (adapted for mongoose models)
        // Transaction.aggregate is available on Model.
        // PROMPT.md uses 'userId' as ObjectId, but in Clerk/Our model it's string.
        // We must check how userId is stored in Transaction.
        // In Transaction.ts: userId: { type: String, required: true, index: true },
        // So in aggregate $match, use string directly, NOT ObjectId.

        const results = await Transaction.aggregate([
            {
                $match: {
                    userId: userId, // String match
                    transactionDate: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalIncome: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$type", TransactionTypeEnum.INCOME] }, // Ensure Enum matches data
                                            "$amount", // Assumes amount is number (positive)
                                            // Wait, if INCOME/EXPENSE are distinct types, this is fine.
                                            // But PROMPT.md logic had $abs amount. 
                                            // Our model has amount: Number.
                                            // If DEBIT is negative? No, schema says mostly amount is Number (probably positive).
                                            // Let's assume absolute positive numbers store.
                                            // PROMPT.md uses TransactionTypeEnum.INCOME ('INCOME') and EXPENSE.
                                            // Our updated Transaction.ts supports 'INCOME', 'EXPENSE', 'DEBIT', 'CREDIT'.
                                            // We should match against all relevant types or normalize.
                                            // Assuming new transactions use INCOME/EXPENSE. Old ones DEBIT/CREDIT.
                                            // Map: INCOME/CREDIT -> Income, EXPENSE/DEBIT -> Expense.
                                            0,
                                        ],
                                    },
                                },
                                totalExpenses: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $or: [
                                                    { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                                                    { $eq: ["$type", "DEBIT"] }
                                                ]
                                            },
                                            "$amount",
                                            0,
                                        ],
                                    },
                                },
                                // Income needs CREDIT too
                                // Let's refine the conditional sum.
                            },
                        },
                    ],
                    categories: [
                        {
                            $match: {
                                type: { $in: [TransactionTypeEnum.EXPENSE, "DEBIT"] }
                            },
                        },
                        {
                            $group: {
                                _id: "$category",
                                total: { $sum: "$amount" },
                            },
                        },
                        {
                            $sort: { total: -1 },
                        },
                        {
                            $limit: 5,
                        },
                    ],
                },
            },
            {
                $project: {
                    totalIncome: { $arrayElemAt: ["$summary.totalIncome", 0] },
                    totalExpenses: { $arrayElemAt: ["$summary.totalExpenses", 0] },
                    categories: 1,
                },
            },
        ]);

        // Fix for income aggregation above (it was messy in pipeline)
        // Let's re-do separate aggregates or safer pipeline logic.
        // actually easier to do JS calculation if data volume isn't massive? No, aggregation is better.
        // But pipeline above had conditional logic issues.

        // Revised Pipeline logic:
        // Calculate totals.

        // Actually, let's fetch summary stats using simple find/reduce if safer for mixed types?
        // Or fix pipeline:
        // $cond: [ { $in: ["$type", ["INCOME", "CREDIT"]] }, "$amount", 0 ]

        // Let's stick to simple JS for reliability on prototype unless optimization needed. 
        // PROMPT.md uses pipeline, so I should try to follow.
        // But types are mixed now.

        // Re-run Aggregation with fixed logic
        const aggregation = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    transactionDate: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [
                                { $in: ["$type", ["INCOME", "CREDIT"]] },
                                "$amount",
                                0
                            ]
                        }
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [
                                { $in: ["$type", ["EXPENSE", "DEBIT"]] },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const categoryAggregation = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    transactionDate: { $gte: fromDate, $lte: toDate },
                    type: { $in: ["EXPENSE", "DEBIT"] }
                },
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);

        const totalIncome = aggregation[0]?.totalIncome || 0;
        const totalExpenses = aggregation[0]?.totalExpenses || 0;

        // PROMPT.md uses convertToDollarUnit for insights.
        // If stored as regular numbers (dollars), no conversion needed?
        // PROMPT.md util: convertToDollarUnit = amount / 100.
        // Implies stored as CENTS.
        // My Transaction.ts: "Store as is (likely decimal) for now".
        // If I store as Dollars, I should NOT divide by 100.
        // Checks: Current AA data is usually exact amount (dollars/rupees).
        // Manual entry: validator takes number.
        // I will assume DOLLARS storage. So NO /100 conversion for display/AI.
        // Or if I use `convertToDollarUnit`, I must ensure inputs are cents.
        // Let's assume DOLLARS for now to match current state.

        const availableBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        const byCategory = categoryAggregation.reduce((acc: any, curr) => {
            acc[curr._id] = {
                amount: curr.total,
                percentage: totalExpenses > 0 ? Math.round((curr.total / totalExpenses) * 100) : 0
            };
            return acc;
        }, {} as Record<string, { amount: number; percentage: number }>);

        const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

        const insights = await generateReportInsights({
            totalIncome,
            totalExpenses,
            availableBalance,
            savingsRate: parseFloat(savingsRate.toFixed(1)),
            categories: byCategory,
            periodLabel
        });

        // Create Report Document
        const report = await Report.create({
            userId,
            period: periodLabel,
            sentDate: new Date(),
            status: ReportStatusEnum.SENT,
            totalIncome,
            totalExpenses,
            availableBalance,
            savingsRate,
            topSpendingCategories: Object.entries(byCategory).map(([name, cat]: any) => ({
                name,
                amount: cat.amount,
                percent: cat.percentage
            })),
            insights
        });

        return NextResponse.json({
            success: true,
            report,
            data: {
                period: periodLabel,
                summary: {
                    income: totalIncome,
                    expenses: totalExpenses,
                    balance: availableBalance,
                    savingsRate: parseFloat(savingsRate.toFixed(1)),
                    topCategories: report.topSpendingCategories
                },
                insights
            }
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
