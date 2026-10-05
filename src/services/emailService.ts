'use server';

export interface EmailOrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface SendOrderEmailPayload {
  orderId: string;
  dateStr: string;
  customerEmail: string;
  items: EmailOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string;
}

export interface SendEmailResult {
  sent: boolean;
  reason?: string;
  error?: string;
}

/**
 * Server-only Mailgun email dispatch service.
 * NEVER exposes API keys or secrets to the browser or client-side JavaScript.
 */
export async function sendOrderConfirmationEmail(
  payload: SendOrderEmailPayload
): Promise<SendEmailResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail =
    process.env.MAILGUN_FROM_EMAIL ||
    (domain ? `postmaster@${domain}` : 'postmaster@shadevault.com');

  if (!apiKey || !domain) {
    console.warn(
      `[MAILGUN NOTICE] Mailgun configuration missing (MAILGUN_API_KEY or MAILGUN_DOMAIN not set). Email dispatch skipped for order ${payload.orderId}.`
    );
    return { sent: false, reason: 'unconfigured' };
  }

  const { orderId, dateStr, customerEmail, items, subtotal, tax, total, shippingAddress } = payload;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-family: monospace; font-size: 13px;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-family: monospace; font-size: 13px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-family: monospace; font-size: 13px; text-align: right;">$${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #eab308; font-family: monospace; font-size: 13px; text-align: right; font-weight: bold;">$${item.price * item.quantity}</td>
    </tr>`
    )
    .join('');

  const itemsText = items
    .map((item) => `- ${item.productName} (x${item.quantity}): $${item.price * item.quantity}`)
    .join('\n');

  const plainText = `
SHADEVAULT | Precision Eyewear
Order Confirmation - ${orderId}

Thank you for your order! Your luxury eyewear selection has been confirmed.

Order Summary:
Order Number: ${orderId}
Order Date: ${dateStr}
Customer Email: ${customerEmail}

Purchased Items:
${itemsText}

Subtotal: $${subtotal}
Estimated Tax (8%): $${tax}
Total Amount: $${total}

Delivery Address:
${shippingAddress}

Thank you for choosing ShadeVault.
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 32px;">
          <!-- Header Branding -->
          <tr>
            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; tracking-spacing: 2px; color: #f4f4f5;">
                SHADE<span style="color: #eab308;">VAULT</span>
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; font-family: monospace; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px;">
                Precision Luxury Eyewear
              </p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 24px 0 16px 0;">
              <h2 style="margin: 0; font-size: 18px; color: #eab308; font-weight: 700;">Order Confirmation</h2>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #d4d4d8; line-height: 1.6;">
                Thank you for your purchase! Your order has been successfully processed and recorded.
              </p>
            </td>
          </tr>

          <!-- Metadata Grid -->
          <tr>
            <td style="padding: 16px; background-color: #09090b; border-radius: 8px; border: 1px solid #27272a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: monospace; font-size: 12px; color: #a1a1aa;">
                <tr>
                  <td style="padding: 4px 0;"><strong>Order Number:</strong> <span style="color: #f4f4f5;">${orderId}</span></td>
                  <td style="padding: 4px 0; text-align: right;"><strong>Date:</strong> <span style="color: #f4f4f5;">${dateStr}</span></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Customer Email:</strong> <span style="color: #f4f4f5;">${customerEmail}</span></td>
                  <td style="padding: 4px 0; text-align: right;"><strong>Status:</strong> <span style="color: #34d399;">Confirmed</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 24px 0 16px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-family: monospace; text-transform: uppercase; color: #a1a1aa;">Order Items</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #27272a;">
                    <th align="left" style="padding: 8px 10px; color: #a1a1aa; font-family: monospace; font-size: 11px; text-transform: uppercase;">Product</th>
                    <th align="center" style="padding: 8px 10px; color: #a1a1aa; font-family: monospace; font-size: 11px; text-transform: uppercase;">Qty</th>
                    <th align="right" style="padding: 8px 10px; color: #a1a1aa; font-family: monospace; font-size: 11px; text-transform: uppercase;">Price</th>
                    <th align="right" style="padding: 8px 10px; color: #a1a1aa; font-family: monospace; font-size: 11px; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 16px; background-color: #09090b; border-radius: 8px; border: 1px solid #27272a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: monospace; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #a1a1aa;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #f4f4f5;">$${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #a1a1aa;">Insured Express Courier</td>
                  <td style="padding: 4px 0; text-align: right; color: #34d399;">FREE</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #a1a1aa;">Estimated Sales Tax (8%)</td>
                  <td style="padding: 4px 0; text-align: right; color: #f4f4f5;">$${tax}</td>
                </tr>
                <tr style="border-top: 1px solid #27272a;">
                  <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: bold; color: #f4f4f5;">Final Total</td>
                  <td style="padding: 12px 0 4px 0; text-align: right; font-size: 16px; font-weight: bold; color: #eab308;">$${total}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 24px 0 16px 0; font-size: 12px; font-family: monospace; color: #a1a1aa;">
              <strong style="color: #d4d4d8; display: block; margin-bottom: 4px;">Delivery Destination:</strong>
              ${shippingAddress}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; border-top: 1px solid #27272a; font-size: 11px; font-family: monospace; color: #71717a;">
              ShadeVault Precision Optics • Encrypted Vault Logistics
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const endpoint = `https://api.mailgun.net/v3/${domain}/messages`;
    const authHeader = 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64');

    const params = new URLSearchParams();
    params.append('from', fromEmail);
    params.append('to', customerEmail);
    params.append('subject', `Order Confirmation - ${orderId} | ShadeVault`);
    params.append('text', plainText);
    params.append('html', htmlContent);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[MAILGUN ERROR] Email dispatch failed for order ${orderId}. HTTP Status: ${response.status} ${response.statusText}. Response: ${errorText}`
      );
      return {
        sent: false,
        error: `Mailgun HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const resData = await response.json().catch(() => ({}));
    console.log(
      `[MAILGUN SUCCESS] Confirmation email dispatched successfully to ${customerEmail} for order ${orderId}. Mailgun Message ID: ${resData.id || 'ok'}`
    );

    return { sent: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[MAILGUN ERROR] Exception caught during email dispatch for order ${orderId}:`, errorMsg);
    return {
      sent: false,
      error: errorMsg || 'Network error during Mailgun API call.',
    };
  }
}
