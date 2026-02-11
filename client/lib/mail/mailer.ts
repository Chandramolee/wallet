
import { resend } from './resend';

type Params = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
};

const mailer_sender = `Finora <notifications@finora.app>`; // Placeholder domain

export const sendEmail = async ({
    to,
    from = mailer_sender,
    subject,
    text,
    html,
}: Params) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email.');
        return;
    }

    return await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        text,
        subject,
        html,
    });
};
