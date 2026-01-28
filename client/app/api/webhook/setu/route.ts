import { NextRequest, NextResponse } from 'next/server';

const SETU_BASE_URL = process.env.SETU_BASE_URL || 'https://sandbox.api-setu.in/aa/fiu/v1';
const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID;

interface SetuNotification {
    notificationType: 'CONSENT_NOTIFICATION' | 'DATA_NOTIFICATION';
    consentId?: string;
    ConsentId?: string;
    DataSessionId?: string;
    status: string;
    timestamp?: string;
}

/**
 * Webhook handler for Setu AA notifications
 * Configure this URL in Setu Bridge: https://your-app.com/api/webhook/setu
 */
export async function POST(req: NextRequest) {
    try {
        const payload: SetuNotification = await req.json();
        console.log('Setu webhook received:', JSON.stringify(payload, null, 2));

        // Verify webhook signature if needed (check Setu docs for signature verification)
        // const signature = req.headers.get('x-setu-signature');

        const consentId = payload.consentId || payload.ConsentId;

        switch (payload.notificationType) {
            case 'CONSENT_NOTIFICATION':
                await handleConsentNotification(consentId!, payload.status);
                break;

            case 'DATA_NOTIFICATION':
                await handleDataNotification(payload.DataSessionId!, payload.status);
                break;

            default:
                console.log('Unknown notification type:', payload.notificationType);
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleConsentNotification(consentId: string, status: string) {
    console.log(`Consent ${consentId} status: ${status}`);

    // TODO: Update consent in MongoDB
    // await connectDB();
    // await Consent.findOneAndUpdate(
    //   { consentId },
    //   { status }
    // );

    if (status === 'ACTIVE') {
        // Consent approved - create data session
        await createDataSession(consentId);
    } else if (status === 'REJECTED' || status === 'REVOKED') {
        console.log('Consent rejected/revoked:', consentId);
    }
}

async function handleDataNotification(sessionId: string, status: string) {
    console.log(`Data session ${sessionId} status: ${status}`);

    // TODO: Update consent record with session status
    // await Consent.findOneAndUpdate(
    //   { dataSessionId: sessionId },
    //   { dataSessionStatus: status }
    // );

    if (status === 'READY') {
        // Data is ready - fetch it
        await fetchDataFromSession(sessionId);
    }
}

async function createDataSession(consentId: string) {
    if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET || !SETU_PRODUCT_INSTANCE_ID) {
        console.error('Setu credentials not configured');
        return;
    }

    try {
        const response = await fetch(`${SETU_BASE_URL}/data-sessions`, {
            method: 'POST',
            headers: {
                'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
                'x-client-id': SETU_CLIENT_ID,
                'x-client-secret': SETU_CLIENT_SECRET,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ConsentId: consentId }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Data session creation failed:', error);
            return;
        }

        const data = await response.json();
        console.log('Data session created:', data.id);

        // TODO: Save session ID to consent record
        // await Consent.findOneAndUpdate(
        //   { consentId },
        //   { dataSessionId: data.id, dataSessionStatus: 'PENDING' }
        // );
    } catch (error) {
        console.error('Data session creation error:', error);
    }
}

async function fetchDataFromSession(sessionId: string) {
    if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET || !SETU_PRODUCT_INSTANCE_ID) {
        console.error('Setu credentials not configured');
        return;
    }

    try {
        const response = await fetch(`${SETU_BASE_URL}/data/${sessionId}`, {
            headers: {
                'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
                'x-client-id': SETU_CLIENT_ID,
                'x-client-secret': SETU_CLIENT_SECRET,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Data fetch failed:', error);
            return;
        }

        const encryptedData = await response.json();
        console.log('Encrypted data received, FI count:', encryptedData.fip?.length || 0);

        // TODO: Decrypt using Setu Rahasya
        // npm install @setu/rahasya
        // import { decrypt } from '@setu/rahasya';
        // const decrypted = await decrypt(encryptedData, privateKey);

        // TODO: Process and save transactions to MongoDB
        // await processAndSaveTransactions(decrypted, userId);

        // TODO: Trigger AI categorization
        // const narrations = transactions.map(tx => tx.narration);
        // const categorized = await batchCategorizeTransactions(narrations);
    } catch (error) {
        console.error('Data fetch error:', error);
    }
}
