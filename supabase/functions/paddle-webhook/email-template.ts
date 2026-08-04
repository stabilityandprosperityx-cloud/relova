export interface PurchaseEmailParams {
  planLabel: string;       // "Pro" or "Full"
  dashboardUrl: string;
  isAutoCreatedAccount: boolean;
  recipientName?: string;
}

export function buildPurchaseEmailHtml(params: PurchaseEmailParams): string {
  const { planLabel, dashboardUrl, isAutoCreatedAccount, recipientName } = params;

  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";

  const guestCallout = isAutoCreatedAccount
    ? `
      <tr>
        <td style="padding: 0 0 28px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ede9fc; border-radius: 8px; border: 1px solid #c4b8f5;">
            <tr>
              <td style="padding: 18px 20px;">
                <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #5b4fe0; letter-spacing: 0.04em; text-transform: uppercase;">One more thing</p>
                <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #3d3265;">
                  Since you checked out as a guest, we've automatically created your Relova account.
                  <strong>Check your inbox for a separate email with a link to set your password and log in.</strong>
                  Once you're in, your ${planLabel} plan will be waiting for you.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Relova ${planLabel}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f1e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f1e8; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #fffdf9; border-radius: 12px; border: 1px solid #e8e0d0; overflow: hidden;">

          <!-- Header bar -->
          <tr>
            <td style="padding: 28px 40px 20px 40px; border-bottom: 1px solid #f0e8d8;">
              <p style="margin: 0; font-family: Fraunces, Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #5b4fe0; letter-spacing: -0.02em;">Relova</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 8px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Heading -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <h1 style="margin: 0; font-family: Fraunces, Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #2a2622; line-height: 1.2;">
                      Welcome to Relova ${planLabel} &#x1F389;
                    </h1>
                  </td>
                </tr>

                <!-- Greeting + body copy -->
                <tr>
                  <td style="padding: 0 0 28px 0;">
                    <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.65; color: #544d42;">${greeting}</p>
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #544d42;">
                      Relocating to a new country is one of the biggest decisions a person can make — and we built Relova to make that process a lot less overwhelming. Your <strong>${planLabel} plan</strong> is now active and everything is ready for you. We're genuinely glad you're here.
                    </p>
                  </td>
                </tr>

                <!-- What's next -->
                <tr>
                  <td style="padding: 0 0 28px 0;">
                    <p style="margin: 0 0 16px 0; font-family: Fraunces, Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 700; color: #2a2622;">What's next</p>

                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="32" valign="top" style="padding-top: 1px;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #5b4fe0; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #fff;">1</div>
                        </td>
                        <td style="font-size: 14px; line-height: 1.55; color: #544d42;">
                          <strong style="color: #2a2622;">Complete your relocation profile</strong> — answer a few questions so Relova can tailor your plan to your situation.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="32" valign="top" style="padding-top: 1px;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #5b4fe0; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #fff;">2</div>
                        </td>
                        <td style="font-size: 14px; line-height: 1.55; color: #544d42;">
                          <strong style="color: #2a2622;">Explore your personalized country matches</strong> — see which destinations you're the strongest fit for, with real visa paths and cost data.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-top: 1px;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #5b4fe0; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #fff;">3</div>
                        </td>
                        <td style="font-size: 14px; line-height: 1.55; color: #544d42;">
                          <strong style="color: #2a2622;">Start your step-by-step relocation plan</strong> — track documents, timelines, and use the AI advisor whenever you have questions along the way.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Guest callout (only when isAutoCreatedAccount) -->
                ${guestCallout}

                <!-- CTA button -->
                <tr>
                  <td align="center" style="padding: 4px 0 36px 0;">
                    <a href="${dashboardUrl}"
                      style="display: inline-block; background-color: #5b4fe0; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.01em;">
                      Go to your dashboard
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 28px 40px; border-top: 1px solid #f0e8d8;">
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #948c7d; text-align: center;">
                Questions? Just reply to this email.<br />
                <span style="color: #b8ae9e;">Relova &middot; <a href="https://relova.ai" style="color: #948c7d; text-decoration: none;">relova.ai</a></span>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
