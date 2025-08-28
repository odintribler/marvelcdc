#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

// Import the new HTTP-based email function
import { sendEmail, testEmailConfiguration } from '../server/utils/email.js'

async function testHttpEmail() {
  const testEmail = process.argv[2]
  
  if (!testEmail) {
    console.error('❌ Please provide a test email address')
    console.log('Usage: npm run test-http-email <email>')
    console.log('Example: npm run test-http-email admin@example.com')
    process.exit(1)
  }

  console.log('🚀 Testing Brevo HTTP API Email Implementation')
  console.log('==============================================\n')

  // First test configuration
  console.log('1️⃣  Testing API Configuration...')
  const configValid = await testEmailConfiguration()
  
  if (!configValid) {
    console.error('❌ Email configuration test failed!')
    console.log('\nPlease check:')
    console.log('1. BREVO_API_KEY is set correctly')
    console.log('2. FROM_EMAIL is set correctly')
    console.log('3. Your Brevo account is active')
    process.exit(1)
  }

  console.log('✅ Configuration test passed!\n')

  // Now try sending an actual email
  console.log('2️⃣  Sending Test Email...')
  console.log(`To: ${testEmail}`)
  
  try {
    const startTime = Date.now()
    
    await sendEmail({
      to: testEmail,
      subject: 'Test Email - Brevo HTTP API',
      html: `
        <h2>Brevo HTTP API Test</h2>
        <p>This email was sent using the Brevo HTTP API instead of SMTP.</p>
        <p><strong>Advantages:</strong></p>
        <ul>
          <li>No SMTP port blocking issues</li>
          <li>Works reliably in cloud environments</li>
          <li>Faster than SMTP handshake</li>
          <li>Better error reporting</li>
        </ul>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
      `,
      text: `Brevo HTTP API Test

This email was sent using the Brevo HTTP API instead of SMTP.

Advantages:
- No SMTP port blocking issues
- Works reliably in cloud environments
- Faster than SMTP handshake
- Better error reporting

Sent at: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || 'development'}`
    })
    
    const duration = Date.now() - startTime
    console.log(`✅ Email sent successfully in ${duration}ms!`)
    console.log('\n🎉 HTTP API implementation is working correctly!')
    
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your Brevo API key is correct')
    console.log('2. Verify the FROM_EMAIL is authorized in Brevo')
    console.log('3. Check Brevo dashboard for any account issues')
    process.exit(1)
  }
}

// Run the test
testHttpEmail().catch(console.error)