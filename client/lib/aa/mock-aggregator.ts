/**
 * Mock Aggregator Helper
 * Mimics Setu AA API responses for development
 * Enable via USE_MOCK_AA=true in .env
 */

import { addDays, subDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Indian merchant data with categories
const INDIAN_MERCHANTS = [
    // Food & Drinks
    { name: 'Zomato', narrations: ['ZOMATO*', 'ZOMATO PAYTM', 'BUNDL*ZOMATO'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'Swiggy', narrations: ['SWIGGY*', 'SWIGGY PAYTM', 'BUNDL*SWIGGY'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'McDonald\'s', narrations: ['MCDONALDS*', 'MCD INDIA'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'Starbucks', narrations: ['STARBUCKS*', 'TATA STARBUCKS'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'Dominos', narrations: ['DOMINOS*', 'JUBILANT FOODWORKS'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'KFC', narrations: ['KFC*', 'DEVYANI INTL'], category: 'FOOD', sentiment: 'DISCRETIONARY' },
    { name: 'Barbeque Nation', narrations: ['BARBEQUE NATION*', 'BBQ NATION'], category: 'FOOD', sentiment: 'DISCRETIONARY' },

    // Shopping
    { name: 'Amazon', narrations: ['AMAZON*', 'AMZN MKTP', 'AMAZON PAY'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },
    { name: 'Flipkart', narrations: ['FLIPKART*', 'FK RETAIL'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },
    { name: 'Myntra', narrations: ['MYNTRA*', 'MYNTRA FLIPKART'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },
    { name: 'Nykaa', narrations: ['NYKAA*', 'FSN ECOMMERCE'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },
    { name: 'Ajio', narrations: ['AJIO*', 'RELIANCE AJIO'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },
    { name: 'Decathlon', narrations: ['DECATHLON*'], category: 'SHOPPING', sentiment: 'DISCRETIONARY' },

    // Transport
    { name: 'Uber', narrations: ['UBER*', 'UBER INDIA'], category: 'TRANSPORT', sentiment: 'DISCRETIONARY' },
    { name: 'Ola', narrations: ['OLA*', 'ANI TECHNOLOGIES'], category: 'TRANSPORT', sentiment: 'DISCRETIONARY' },
    { name: 'Rapido', narrations: ['RAPIDO*'], category: 'TRANSPORT', sentiment: 'DISCRETIONARY' },
    { name: 'IRCTC', narrations: ['IRCTC*', 'INDIAN RAILWAYS'], category: 'TRANSPORT', sentiment: 'ESSENTIAL' },
    { name: 'MakeMyTrip', narrations: ['MAKEMYTRIP*', 'MMT'], category: 'TRANSPORT', sentiment: 'DISCRETIONARY' },
    { name: 'Petrol', narrations: ['IOCL*', 'BPCL*', 'HPCL*', 'INDIAN OIL', 'BHARAT PETROLEUM'], category: 'TRANSPORT', sentiment: 'ESSENTIAL' },

    // Bills & Utilities
    { name: 'Electricity', narrations: ['TATA POWER*', 'BESCOM*', 'BSES*', 'MSEDCL*', 'ADANI ELECTRICITY'], category: 'BILLS', sentiment: 'ESSENTIAL' },
    { name: 'Mobile Recharge', narrations: ['JIO*', 'AIRTEL*', 'VI RECHARGE', 'BSNL*'], category: 'BILLS', sentiment: 'ESSENTIAL' },
    { name: 'Gas', narrations: ['MAHANAGAR GAS*', 'IGL*', 'ADANI GAS'], category: 'BILLS', sentiment: 'ESSENTIAL' },
    { name: 'Broadband', narrations: ['ACT FIBERNET*', 'AIRTEL BROADBAND', 'JIO FIBER'], category: 'BILLS', sentiment: 'ESSENTIAL' },

    // Entertainment
    { name: 'BookMyShow', narrations: ['BOOKMYSHOW*', 'BMS CINEMAS'], category: 'ENTERTAINMENT', sentiment: 'DISCRETIONARY' },
    { name: 'PVR', narrations: ['PVR*', 'PVR INOX'], category: 'ENTERTAINMENT', sentiment: 'DISCRETIONARY' },
    { name: 'PlayStation', narrations: ['PLAYSTATION*', 'SONY NETWORK'], category: 'ENTERTAINMENT', sentiment: 'DISCRETIONARY' },

    // Subscriptions
    { name: 'Netflix', narrations: ['NETFLIX*', 'NETFLIX.COM'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },
    { name: 'Spotify', narrations: ['SPOTIFY*'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },
    { name: 'Amazon Prime', narrations: ['PRIME VIDEO*', 'AMAZON PRIME'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },
    { name: 'Disney+ Hotstar', narrations: ['HOTSTAR*', 'DISNEY PLUS'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },
    { name: 'YouTube Premium', narrations: ['GOOGLE*YOUTUBE', 'YT PREMIUM'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },
    { name: 'iCloud', narrations: ['APPLE.COM/BILL', 'ICLOUD'], category: 'SUBSCRIPTIONS', sentiment: 'DISCRETIONARY' },

    // Investments
    { name: 'Zerodha', narrations: ['ZERODHA*', 'ZERODHA BROKING'], category: 'INVESTMENTS', sentiment: 'SAVINGS' },
    { name: 'Groww', narrations: ['GROWW*', 'GROWW INVEST'], category: 'INVESTMENTS', sentiment: 'SAVINGS' },
    { name: 'Mutual Fund', narrations: ['SBI MF*', 'HDFC MF*', 'AXIS MF*', 'ICICI PRU MF'], category: 'INVESTMENTS', sentiment: 'SAVINGS' },

    // Transfers
    { name: 'UPI Transfer', narrations: ['UPI/', 'UPI-'], category: 'TRANSFERS', sentiment: 'DISCRETIONARY' },
    { name: 'NEFT', narrations: ['NEFT/', 'NEFT-'], category: 'TRANSFERS', sentiment: 'DISCRETIONARY' },
    { name: 'IMPS', narrations: ['IMPS/', 'IMPS-'], category: 'TRANSFERS', sentiment: 'DISCRETIONARY' },
];

// Income sources
const INCOME_SOURCES = [
    { name: 'Salary', narrations: ['SALARY', 'SAL CR', 'PAYROLL'], category: 'INCOME', sentiment: 'SAVINGS' },
    { name: 'Interest', narrations: ['INT CREDIT', 'INTEREST'], category: 'INCOME', sentiment: 'SAVINGS' },
    { name: 'Refund', narrations: ['REFUND', 'CASHBACK'], category: 'INCOME', sentiment: 'SAVINGS' },
];

// Indian bank names
const BANKS = [
    { name: 'HDFC Bank', ifsc: 'HDFC0001234', logo: '/banks/hdfc.png' },
    { name: 'ICICI Bank', ifsc: 'ICIC0001234', logo: '/banks/icici.png' },
    { name: 'State Bank of India', ifsc: 'SBIN0001234', logo: '/banks/sbi.png' },
    { name: 'Axis Bank', ifsc: 'UTIB0001234', logo: '/banks/axis.png' },
    { name: 'Kotak Mahindra Bank', ifsc: 'KKBK0001234', logo: '/banks/kotak.png' },
];

interface MockTransaction {
    narration: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    transactionDate: Date;
    valueDate: Date;
    reference: string;
    category?: string;
    merchant?: string;
    sentiment?: string;
}

interface MockAccount {
    accountNumber: string;
    maskedAccountNumber: string;
    bankName: string;
    accountType: 'SAVINGS' | 'CURRENT';
    ifscCode: string;
    balance: number;
    currency: string;
}

interface MockConsentResponse {
    id: string;
    url: string;
    status: 'PENDING';
}

function generateAccountNumber(): string {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function maskAccountNumber(accountNumber: string): string {
    return 'XXXX' + accountNumber.slice(-4);
}

function generateReference(): string {
    return 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function randomAmount(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate realistic mock transactions for the last N months
 */
export function generateMockTransactions(months: number = 3): MockTransaction[] {
    const transactions: MockTransaction[] = [];
    const today = new Date();

    for (let m = 0; m < months; m++) {
        const monthDate = subMonths(today, m);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = m === 0 ? today : endOfMonth(monthDate);

        // Generate salary (once per month, around 1st)
        const salaryDate = addDays(monthStart, Math.floor(Math.random() * 3));
        if (salaryDate <= monthEnd) {
            transactions.push({
                narration: 'SALARY CREDIT - YOUR COMPANY PVT LTD',
                amount: randomAmount(50000, 150000),
                type: 'CREDIT',
                transactionDate: salaryDate,
                valueDate: salaryDate,
                reference: generateReference(),
                category: 'INCOME',
                merchant: 'Salary',
                sentiment: 'SAVINGS',
            });
        }

        // Generate 30-60 random transactions per month
        const numTransactions = 30 + Math.floor(Math.random() * 30);
        const daysInPeriod = Math.floor((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));

        for (let t = 0; t < numTransactions; t++) {
            const dayOffset = Math.floor(Math.random() * daysInPeriod);
            const txDate = addDays(monthStart, dayOffset);

            if (txDate > today) continue;

            // 85% debits, 15% credits
            const isDebit = Math.random() > 0.15;

            if (isDebit) {
                const merchant = pickRandom(INDIAN_MERCHANTS);
                const narration = pickRandom(merchant.narrations) + ' ' + generateReference().substring(0, 6);

                // Amount based on category
                let amount: number;
                switch (merchant.category) {
                    case 'FOOD':
                        amount = randomAmount(100, 2000);
                        break;
                    case 'SHOPPING':
                        amount = randomAmount(500, 15000);
                        break;
                    case 'TRANSPORT':
                        amount = randomAmount(50, 3000);
                        break;
                    case 'BILLS':
                        amount = randomAmount(200, 5000);
                        break;
                    case 'ENTERTAINMENT':
                        amount = randomAmount(200, 2000);
                        break;
                    case 'SUBSCRIPTIONS':
                        amount = randomAmount(100, 1500);
                        break;
                    case 'INVESTMENTS':
                        amount = randomAmount(1000, 50000);
                        break;
                    case 'TRANSFERS':
                        amount = randomAmount(500, 20000);
                        break;
                    default:
                        amount = randomAmount(100, 5000);
                }

                transactions.push({
                    narration,
                    amount,
                    type: 'DEBIT',
                    transactionDate: txDate,
                    valueDate: txDate,
                    reference: generateReference(),
                    category: merchant.category,
                    merchant: merchant.name,
                    sentiment: merchant.sentiment,
                });
            } else {
                // Credits: refunds, interest, small transfers
                const source = pickRandom(INCOME_SOURCES);
                transactions.push({
                    narration: pickRandom(source.narrations) + ' ' + generateReference().substring(0, 6),
                    amount: randomAmount(100, 5000),
                    type: 'CREDIT',
                    transactionDate: txDate,
                    valueDate: txDate,
                    reference: generateReference(),
                    category: source.category,
                    merchant: source.name,
                    sentiment: source.sentiment,
                });
            }
        }

        // Add subscriptions (fixed amounts, recurring)
        const subscriptions = INDIAN_MERCHANTS.filter(m => m.category === 'SUBSCRIPTIONS');
        const activeSubscriptions = subscriptions.slice(0, 3 + Math.floor(Math.random() * 3));

        for (const sub of activeSubscriptions) {
            const subDate = addDays(monthStart, 5 + Math.floor(Math.random() * 5));
            if (subDate <= monthEnd) {
                transactions.push({
                    narration: pickRandom(sub.narrations) + ' SUBSCRIPTION',
                    amount: sub.name === 'Netflix' ? 649 : sub.name === 'Spotify' ? 119 : randomAmount(99, 299),
                    type: 'DEBIT',
                    transactionDate: subDate,
                    valueDate: subDate,
                    reference: generateReference(),
                    category: 'SUBSCRIPTIONS',
                    merchant: sub.name,
                    sentiment: 'DISCRETIONARY',
                });
            }
        }
    }

    // Sort by date descending
    return transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
}

/**
 * Generate a mock bank account
 */
export function generateMockAccount(): MockAccount {
    const bank = pickRandom(BANKS);
    const accountNumber = generateAccountNumber();

    return {
        accountNumber,
        maskedAccountNumber: maskAccountNumber(accountNumber),
        bankName: bank.name,
        accountType: 'SAVINGS',
        ifscCode: bank.ifsc,
        balance: randomAmount(10000, 500000),
        currency: 'INR',
    };
}

/**
 * Mock consent creation response
 */
export function createMockConsent(mobile: string): MockConsentResponse {
    const consentId = 'MOCK_' + Date.now().toString(36).toUpperCase();

    return {
        id: consentId,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/mock-consent?id=${consentId}&mobile=${mobile}`,
        status: 'PENDING',
    };
}

/**
 * Mock consent approval (simulates user completing consent flow)
 */
export function approveMockConsent(consentId: string): { status: 'ACTIVE'; dataSessionId: string } {
    return {
        status: 'ACTIVE',
        dataSessionId: 'MOCK_SESSION_' + Date.now().toString(36).toUpperCase(),
    };
}

/**
 * Get mock AA data (account + transactions)
 */
export function getMockAAData(months: number = 3): { account: MockAccount; transactions: MockTransaction[] } {
    const account = generateMockAccount();
    const transactions = generateMockTransactions(months);

    // Calculate balance based on transactions
    const totalDebits = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
    account.balance = Math.max(10000, totalCredits - totalDebits + randomAmount(50000, 200000));

    return { account, transactions };
}

export const isMockMode = (): boolean => {
    return process.env.USE_MOCK_AA === 'true';
};
