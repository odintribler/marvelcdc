// Email template system for Marvel Champions Collection
// Professional HTML templates with Marvel Champions branding

export interface TemplateData {
  username: string
  verificationUrl?: string
  resetUrl?: string
  appName?: string
}

// Marvel Champions brand colors
const BRAND_COLORS = {
  primary: '#dc2626', // Red
  secondary: '#1f2937', // Dark gray
  accent: '#fbbf24', // Yellow
  background: '#f9fafb', // Light gray
  text: '#111827', // Dark text
  textLight: '#6b7280', // Light text
}

// Base template wrapper
function createBaseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: ${BRAND_COLORS.background};
      color: ${BRAND_COLORS.text};
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #b91c1c 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 40px 24px;
    }
    .hero-section {
      text-align: center;
      margin-bottom: 32px;
    }
    .hero-section h2 {
      color: ${BRAND_COLORS.text};
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    .hero-section p {
      color: ${BRAND_COLORS.textLight};
      font-size: 16px;
      margin: 0;
    }
    .action-section {
      text-align: center;
      margin: 32px 0;
    }
    .btn, .btn:link, .btn:visited, .btn:hover, .btn:active, .btn:focus {
      display: inline-block !important;
      background: ${BRAND_COLORS.primary} !important;
      color: white !important;
      text-decoration: none !important;
      padding: 16px 32px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background: #b91c1c !important;
      color: white !important;
    }
    
    /* Gmail and iOS Mail specific overrides */
    u + .btn, .btn[x-apple-data-detectors] {
      color: white !important;
    }
    
    /* Outlook specific overrides */
    .btn span {
      color: white !important;
    }
    .security-notice {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .security-notice h3 {
      color: #92400e;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .security-notice p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      background-color: ${BRAND_COLORS.secondary};
      color: white;
      padding: 24px;
      text-align: center;
      font-size: 14px;
    }
    .footer p {
      margin: 0;
      opacity: 0.8;
    }
    .token-display {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      text-align: center;
      letter-spacing: 2px;
      color: ${BRAND_COLORS.text};
    }
    @media (max-width: 600px) {
      .container {
        margin: 0;
        box-shadow: none;
      }
      .header, .content, .footer {
        padding-left: 16px;
        padding-right: 16px;
      }
      .btn {
        display: block;
        max-width: 300px;
        margin: 0 auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MarvelCDC</h1>
      <p>Manage your LCG collection with confidence</p>
    </div>
    ${content}
    <div class="footer">
      <p>&copy; 2025 MarvelCDC. Built for fans, by fans.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Email verification template
export function createVerificationEmailTemplate(data: TemplateData): { html: string; text: string } {
  const { username, verificationUrl } = data

  const content = `
    <div class="content">
      <div class="hero-section">
        <h2>Welcome to MarvelCDC, ${username}!</h2>
        <p>You're just one step away from managing your collection like a true hero.</p>
      </div>

      <div class="action-section">
        <p style="margin-bottom: 24px; color: ${BRAND_COLORS.textLight};">
          Click the button below to verify your email address and activate your account:
        </p>
        <a href="${verificationUrl}" class="btn" style="display: inline-block !important; background: #dc2626 !important; color: white !important; text-decoration: none !important; padding: 16px 32px !important; border-radius: 8px !important; font-weight: 600 !important; font-size: 16px !important;" color="white">
          <!--[if mso]><span style="color: white !important;"><![endif]-->
          Verify Email Address
          <!--[if mso]></span><![endif]-->
        </a>
      </div>

      <div class="security-notice">
        <h3>🛡️ Security Notice</h3>
        <p>
          This verification link will expire in 24 hours for your security. 
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>

      <p style="color: ${BRAND_COLORS.textLight}; font-size: 14px; margin-top: 32px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="word-break: break-all; font-family: monospace;">${verificationUrl}</span>
      </p>
    </div>
  `

  const html = createBaseTemplate(content, 'Verify Your Email - MarvelCDC')

  const text = `
Welcome to MarvelCDC, ${username}!

You're just one step away from managing your collection like a true hero.

To verify your email address and activate your account, visit this link:
${verificationUrl}

This verification link will expire in 24 hours for your security.
If you didn't create an account, you can safely ignore this email.

---
MarvelCDC
Built for fans, by fans.
  `.trim()

  return { html, text }
}

// Password reset template
export function createPasswordResetEmailTemplate(data: TemplateData): { html: string; text: string } {
  const { username, resetUrl } = data

  const content = `
    <div class="content">
      <div class="hero-section">
        <h2>Password Reset Request</h2>
        <p>Hi ${username}, we received a request to reset your password.</p>
      </div>

      <div class="action-section">
        <p style="margin-bottom: 24px; color: ${BRAND_COLORS.textLight};">
          Click the button below to create a new password for your account:
        </p>
        <a href="${resetUrl}" class="btn" style="display: inline-block !important; background: #dc2626 !important; color: white !important; text-decoration: none !important; padding: 16px 32px !important; border-radius: 8px !important; font-weight: 600 !important; font-size: 16px !important;" color="white">
          <!--[if mso]><span style="color: white !important;"><![endif]-->
          Reset Password
          <!--[if mso]></span><![endif]-->
        </a>
      </div>

      <div class="security-notice">
        <h3>🛡️ Security Notice</h3>
        <p>
          This reset link will expire in 1 hour for your security. 
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </div>

      <p style="color: ${BRAND_COLORS.textLight}; font-size: 14px; margin-top: 32px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="word-break: break-all; font-family: monospace;">${resetUrl}</span>
      </p>
    </div>
  `

  const html = createBaseTemplate(content, 'Reset Your Password - MarvelCDC')

  const text = `
Password Reset Request

Hi ${username}, we received a request to reset your password.

To create a new password for your account, visit this link:
${resetUrl}

This reset link will expire in 1 hour for your security.
If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.

---
MarvelCDC
Built for fans, by fans.
  `.trim()

  return { html, text }
}

// Welcome email template (sent after successful verification)
export function createWelcomeEmailTemplate(data: TemplateData): { html: string; text: string } {
  const { username } = data

  const content = `
    <div class="content">
      <div class="hero-section">
        <h2>Welcome to the Team, ${username}!</h2>
        <p>Your email has been verified and your account is now active.</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #10b981;">
        <h3 style="color: #047857; margin: 0 0 16px 0; font-size: 18px;">🎉 You're all set!</h3>
        <p style="color: #047857; margin: 0; font-size: 16px;">
          Start managing your Marvel Champions LCG collection, import decks from MarvelCDB, 
          and track conflicts with confidence.
        </p>
      </div>

      <div class="action-section">
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}" class="btn" style="display: inline-block !important; background: #dc2626 !important; color: white !important; text-decoration: none !important; padding: 16px 32px !important; border-radius: 8px !important; font-weight: 600 !important; font-size: 16px !important;" color="white">
          <!--[if mso]><span style="color: white !important;"><![endif]-->
          Start Managing Your Collection
          <!--[if mso]></span><![endif]-->
        </a>
      </div>

      <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
        <h3 style="color: ${BRAND_COLORS.text}; font-size: 16px; margin: 0 0 12px 0;">Getting Started Tips:</h3>
        <ul style="color: ${BRAND_COLORS.textLight}; margin: 0; padding-left: 20px;">
          <li>Add your owned packs to your collection</li>
          <li>Import decks from MarvelCDB using deck URLs</li>
          <li>Activate decks to see card conflicts automatically</li>
          <li>Track which cards you need to complete your active decks</li>
        </ul>
      </div>
    </div>
  `

  const html = createBaseTemplate(content, 'Welcome to MarvelCDC!')

  const text = `
Welcome to the Team, ${username}!

Your email has been verified and your account is now active.

🎉 You're all set!
Start managing your Marvel Champions LCG collection, import decks from MarvelCDB, 
and track conflicts with confidence.

Getting Started Tips:
• Add your owned packs to your collection
• Import decks from MarvelCDB using deck URLs  
• Activate decks to see card conflicts automatically
• Track which cards you need to complete your active decks

Visit your collection: ${process.env.BASE_URL || 'http://localhost:3000'}

---
MarvelCDC
Built for fans, by fans.
  `.trim()

  return { html, text }
}

// Password changed confirmation template
export function createPasswordChangedEmailTemplate(data: TemplateData): { html: string; text: string } {
  const { username } = data

  const content = `
    <div class="content">
      <div class="hero-section">
        <h2>Password Successfully Changed</h2>
        <p>Hi ${username}, your password has been updated successfully.</p>
      </div>

      <div style="margin: 32px 0; padding: 24px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #10b981;">
        <h3 style="color: #047857; margin: 0 0 16px 0; font-size: 18px;">✅ Confirmed</h3>
        <p style="color: #047857; margin: 0; font-size: 16px;">
          Your password was changed on ${new Date().toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'short',
            timeZone: 'UTC'
          })} UTC.
        </p>
      </div>

      <div class="security-notice">
        <h3>🛡️ Security Notice</h3>
        <p>
          If you didn't make this change, please contact support immediately. 
          For your security, all existing sessions have been logged out.
        </p>
      </div>

      <div class="action-section">
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/login" class="btn" style="display: inline-block !important; background: #dc2626 !important; color: white !important; text-decoration: none !important; padding: 16px 32px !important; border-radius: 8px !important; font-weight: 600 !important; font-size: 16px !important;" color="white">
          <!--[if mso]><span style="color: white !important;"><![endif]-->
          Sign In Again
          <!--[if mso]></span><![endif]-->
        </a>
      </div>
    </div>
  `

  const html = createBaseTemplate(content, 'Password Changed - MarvelCDC')

  const text = `
Password Successfully Changed

Hi ${username}, your password has been updated successfully.

✅ Confirmed
Your password was changed on ${new Date().toLocaleString('en-US', { 
  dateStyle: 'full', 
  timeStyle: 'short',
  timeZone: 'UTC'
})} UTC.

If you didn't make this change, please contact support immediately.
For your security, all existing sessions have been logged out.

Sign in again: ${process.env.BASE_URL || 'http://localhost:3000'}/login

---
MarvelCDC
Built for fans, by fans.
  `.trim()

  return { html, text }
}