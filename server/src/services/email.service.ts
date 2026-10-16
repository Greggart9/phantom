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

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface OrderEmailDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    postcode: string;
    country: string;
    phone?: string;
  };
  items: OrderEmailItem[];
  carrier?: string;
}

/**
 * Send Customer Order Confirmation Email via Resend
 */
export const sendOrderConfirmationEmail = async (
  details: OrderEmailDetails
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[Phantom Email] Resend not configured. Order confirmation for ${details.customerEmail}: #${details.orderNumber}`);
    return { success: false, error: 'RESEND_API_KEY is not configured in .env' };
  }

  const itemsHtml = details.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #262422;">
        <td style="padding: 12px 0; font-size: 13px; color: #ffffff;">
          <strong>${item.name}</strong>
          ${item.size || item.color ? `<br/><span style="font-size: 11px; color: #8e8982;">${[item.size, item.color].filter(Boolean).join(' / ')}</span>` : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; font-size: 13px; color: #bfbab0;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 13px; color: #ffffff;">
          $${(Number(item.price) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: details.customerEmail,
      subject: `Order Confirmation — ${details.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation — Phantom</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0c0b0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f2ee;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #141312; border: 1px solid #262422; border-radius: 8px; padding: 40px 32px;">
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; color: #ffffff;">
                        PHANTOM
                      </h1>
                      <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #cf5230;">
                        ORDER CONFIRMATION
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <p style="margin: 0 0 12px; font-size: 15px; color: #ffffff;">
                        Dear ${details.customerName || 'Valued Collector'},
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #bfbab0;">
                        Thank you for your order. We have received edition <strong>#${details.orderNumber}</strong> and our Lisbon studio is preparing your pieces with archival care.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 12px;">
                        <thead>
                          <tr style="border-bottom: 1px solid #383532;">
                            <th align="left" style="padding-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8e8982;">Item</th>
                            <th align="center" style="padding-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8e8982;">Qty</th>
                            <th align="right" style="padding-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8e8982;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="2" style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #ffffff;">Total Amount Paid</td>
                            <td style="padding-top: 16px; text-align: right; font-size: 16px; font-weight: 700; color: #ffffff;">$${Number(details.totalAmount).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top: 1px solid #262422; padding-top: 20px; padding-bottom: 28px;">
                      <h4 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #cf5230;">Shipping Destination</h4>
                      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #bfbab0;">
                        ${details.shippingAddress.firstName} ${details.shippingAddress.lastName}<br/>
                        ${details.shippingAddress.address}${details.shippingAddress.apartment ? `, ${details.shippingAddress.apartment}` : ''}<br/>
                        ${details.shippingAddress.city}, ${details.shippingAddress.postcode}, ${details.shippingAddress.country}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="border-top: 1px solid #262422; padding-top: 24px;">
                      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #69655f;">
                        Every piece carries our two-year repair guarantee.<br/>
                        Questions? Reach our concierge at <a href="mailto:hello@phantom.studio" style="color: #cf5230; text-decoration: none;">hello@phantom.studio</a>
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
      console.error('[Resend Order Confirmation Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Send Exception]', err);
    return { success: false, error: err.message || 'Unknown email dispatch error' };
  }
};

/**
 * Send Instant Admin Alert Email when a customer places an order
 */
export const sendAdminNewOrderAlertEmail = async (
  details: OrderEmailDetails
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[Phantom Email] Resend not configured. Admin alert for new order: #${details.orderNumber}`);
    return { success: false, error: 'RESEND_API_KEY is not configured in .env' };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@phantom.studio')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    return { success: false, error: 'No admin emails configured' };
  }

  const itemsList = details.items
    .map((i) => `• ${i.name} (${i.quantity}x) — $${(Number(i.price) * i.quantity).toFixed(2)}${i.size ? ` [Size: ${i.size}]` : ''}${i.color ? ` [Color: ${i.color}]` : ''}`)
    .join('\n');

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: adminEmails,
      subject: `[NEW ORDER] #${details.orderNumber} ($${Number(details.totalAmount).toFixed(2)}) by ${details.customerName || details.customerEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0b0a; color: #f4f2ee; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #141312; border: 1px solid #383532; border-radius: 8px; padding: 28px;">
            <div style="border-bottom: 1px solid #2d2b28; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; letter-spacing: 0.25em; color: #cf5230; text-transform: uppercase; font-weight: bold;">PHANTOM ADMIN DISPATCH</span>
              <h2 style="margin: 6px 0 0; color: #ffffff; font-size: 20px;">New Order Placed: #${details.orderNumber}</h2>
            </div>

            <div style="background: #1c1a18; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Customer:</strong> ${details.customerName || 'Collector'}</p>
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Email:</strong> ${details.customerEmail}</p>
              ${details.shippingAddress.phone ? `<p style="margin: 0 0 6px; font-size: 14px;"><strong>Phone:</strong> ${details.shippingAddress.phone}</p>` : ''}
              <p style="margin: 0; font-size: 14px;"><strong>Total Value:</strong> <span style="color: #4ade80; font-weight: bold;">$${Number(details.totalAmount).toFixed(2)}</span></p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #cf5230; margin-bottom: 10px;">Ordered Garments</h3>
              <pre style="background: #0c0b0a; border: 1px solid #2d2b28; padding: 14px; border-radius: 4px; font-size: 13px; color: #e5e5e5; white-space: pre-wrap; font-family: monospace;">${itemsList}</pre>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #cf5230; margin-bottom: 8px;">Delivery Address</h3>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #bfbab0;">
                ${details.shippingAddress.firstName} ${details.shippingAddress.lastName}<br/>
                ${details.shippingAddress.address}${details.shippingAddress.apartment ? `, ${details.shippingAddress.apartment}` : ''}<br/>
                ${details.shippingAddress.city}, ${details.shippingAddress.postcode}, ${details.shippingAddress.country}
              </p>
            </div>

            <div style="border-top: 1px solid #2d2b28; padding-top: 20px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" style="display: inline-block; background-color: #cf5230; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; border-radius: 4px;">
                OPEN IN ADMIN DASHBOARD &rarr;
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[Resend Admin Alert Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Admin Alert Exception]', err);
    return { success: false, error: err.message || 'Unknown email dispatch error' };
  }
};

