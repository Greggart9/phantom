import { Resend } from 'resend';

// Check if Resend API key is provided and valid
export const isResendConfigured = (): boolean => {
  const apiKey = process.env.RESEND_API_KEY;
  return Boolean(apiKey && apiKey.startsWith('re_') && apiKey.length > 10);
};

// Lazy initialization of Resend client
const getResendClient = (): Resend | null => {
  if (!isResendConfigured()) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

const getFromEmail = (): string => {
  return process.env.RESEND_FROM_EMAIL || 'Phantom <onboarding@resend.dev>';
};

/**
 * Send Magic Sign-In Link Email via Resend
 */
export const sendMagicLinkEmail = async (
  to: string,
  magicLink: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[Phantom Email] Resend not configured. Magic Link for ${to}: ${magicLink}`);
    return { success: false, error: 'RESEND_API_KEY is not configured in .env' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject: 'Sign in to Phantom',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign in to Phantom</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0c0b0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f2ee;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #141312; border: 1px solid #262422; border-radius: 8px; padding: 40px 32px; text-align: center;">
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; color: #ffffff;">
                        PHANTOM
                      </h1>
                      <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #cf5230;">
                        AUTHENTICATION
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #bfbab0;">
                        Click the button below to sign in directly to your Phantom account.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #807c75;">
                        This one-time link will securely expire in 15 minutes.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 36px;">
                      <a href="${magicLink}" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(255,255,255,0.15);">
                        SIGN IN TO PHANTOM
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="border-top: 1px solid #262422; padding-top: 24px;">
                      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #69655f;">
                        If you did not request this sign-in link, please ignore this email.<br/>
                        Your account remains secure.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[Resend Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Send Exception]', err);
    return { success: false, error: err.message || 'Unknown email dispatch error' };
  }
};

/**
 * Send Password Reset Email via Resend
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[Phantom Email] Resend not configured. Password Reset for ${to}: ${resetLink}`);
    return { success: false, error: 'RESEND_API_KEY is not configured in .env' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject: 'Reset your Phantom password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password — Phantom</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0c0b0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f2ee;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #141312; border: 1px solid #262422; border-radius: 8px; padding: 40px 32px; text-align: center;">
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; color: #ffffff;">
                        PHANTOM
                      </h1>
                      <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #cf5230;">
                        ACCOUNT SECURITY
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #bfbab0;">
                        We received a request to reset your password.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #807c75;">
                        This password reset link expires in 1 hour.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 36px;">
                      <a href="${resetLink}" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; padding: 14px 32px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(255,255,255,0.15);">
                        RESET PASSWORD
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="border-top: 1px solid #262422; padding-top: 24px;">
                      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #69655f;">
                        If you did not request a password reset, you can safely disregard this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[Resend Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Send Exception]', err);
    return { success: false, error: err.message || 'Unknown email dispatch error' };
  }
};
