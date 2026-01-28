import { NextRequest, NextResponse } from 'next/server';
import { isMockMode, createMockConsent } from '@/lib/aa/mock-aggregator';

const SETU_BASE_URL = process.env.SETU_BASE_URL || 'https://sandbox.api-setu.in/aa/fiu/v1';
const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID;

interface ConsentRequest {
    mobile: string;
    fiTypes?: string[];
    userId?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { mobile, fiTypes = ['DEPOSIT'], userId }: ConsentRequest = await req.json();

        if (!mobile) {
            return NextResponse.json(
                { error: 'Mobile number is required' },
                { status: 400 }
            );
        }

        // Validate mobile format
        const cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
            return NextResponse.json(
                { error: 'Invalid mobile number format' },
                { status: 400 }
            );
        }

        // Mock mode - return mock consent
        if (isMockMode()) {
            const mockConsent = createMockConsent(`+91${cleanMobile}`);
            return NextResponse.json({
                consentId: mockConsent.id,
                redirectUrl: mockConsent.url,
                status: mockConsent.status,
                isMock: true,
            });
        }

        // Real Setu AA integration
        if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET || !SETU_PRODUCT_INSTANCE_ID) {
            return NextResponse.json(
                { error: 'Setu AA credentials not configured' },
                { status: 500 }
            );
        }

        const now = new Date();
        const consentExpiry = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59); // End of next year
        const dataFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1); // 1 year ago

        const payload = {
            consentStart: now.toISOString(),
            consentExpiry: consentExpiry.toISOString(),
            fiTypes,
            dataRange: {
                from: dataFrom.toISOString(),
                to: now.toISOString(),
            },
            fetchType: 'ONETIME',
            purpose: {
                code: '101', // Personal Finance Management
                text: 'Personal Finance Management',
            },
            customer: {
                primaryAccountNumber: `+91${cleanMobile}@setu`, // VUA format
            },
        };

        const response = await fetch(`${SETU_BASE_URL}/consents`, {
            method: 'POST',
            headers: {
                'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
                'x-client-id': SETU_CLIENT_ID,
                'x-client-secret': SETU_CLIENT_SECRET,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Setu consent creation failed:', errorText);
            return NextResponse.json(
                { error: 'Failed to create consent request', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        // TODO: Save consent to MongoDB
        // await connectDB();
        // await Consent.create({
        //   userId,
        //   consentId: data.id,
        //   consentHandle: data.ConsentHandle,
        //   status: 'PENDING',
        //   fiTypes,
        //   vua: `+91${cleanMobile}@setu`,
        //   consentExpiry,
        // });

        return NextResponse.json({
            consentId: data.id,
            consentHandle: data.ConsentHandle,
            redirectUrl: data.url,
            status: 'PENDING',
        });
    } catch (error) {
        console.error('Consent creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
