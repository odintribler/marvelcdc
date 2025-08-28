#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import nodemailer from 'nodemailer'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

const BREVO_SMTP_HOST = 'smtp-relay.brevo.com'
const BREVO_SMTP_PORT = 587

async function testEmailConnection() {
  console.log('🔧 Testing email configuration...\n')
  
  // Check environment variables
  console.log('Environment Variables:')
  console.log('----------------------')
  console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`BREVO_LOGIN_EMAIL: ${process.env.BREVO_LOGIN_EMAIL ? '✅ Set' : '❌ Missing'}`)
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL ? '✅ Set' : '❌ Missing'}`)
  console.log(`BASE_URL: ${process.env.BASE_URL || 'Not set (using default)'}\n`)

  if (!process.env.BREVO_API_KEY || !process.env.BREVO_LOGIN_EMAIL || !process.env.FROM_EMAIL) {
    console.error('❌ Missing required environment variables!')
    process.exit(1)
  }

  console.log('SMTP Configuration:')
  console.log('------------------')
  console.log(`Host: ${BREVO_SMTP_HOST}`)
  console.log(`Port: ${BREVO_SMTP_PORT}`)
  console.log(`Secure: false (using STARTTLS)`)
  console.log(`Auth User: ${process.env.BREVO_LOGIN_EMAIL}\n`)

  // Test with different timeout values
  const timeouts = [5000, 10000, 30000, 60000]
  
  for (const timeout of timeouts) {
    console.log(`\n📧 Testing with ${timeout}ms timeout...`)
    
    const transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false, // use TLS
      auth: {
        user: process.env.BREVO_LOGIN_EMAIL,
        pass: process.env.BREVO_API_KEY,
      },
      connectionTimeout: timeout,
      greetingTimeout: timeout,
      socketTimeout: timeout,
      logger: true, // Enable logging
      debug: true, // Enable debug output
    })

    try {
      const startTime = Date.now()
      await transporter.verify()
      const duration = Date.now() - startTime
      
      console.log(`✅ Connection successful! (took ${duration}ms)`)
      
      // If verification succeeds, try sending a test email
      if (process.argv[2]) {
        const testEmail = process.argv[2]
        console.log(`\n📨 Sending test email to ${testEmail}...`)
        
        const result = await transporter.sendMail({
          from: `"MarvelCDC Test" <${process.env.FROM_EMAIL}>`,
          to: testEmail,
          subject: 'MarvelCDC Email Test',
          text: 'This is a test email from MarvelCDC to verify email configuration.',
          html: '<p>This is a test email from MarvelCDC to verify email configuration.</p>',
        })
        
        console.log(`✅ Test email sent successfully!`)
        console.log(`Message ID: ${result.messageId}`)
      }
      
      await transporter.close()
      process.exit(0)
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error(`❌ Failed with ${timeout}ms timeout (after ${duration}ms)`)
      console.error(`Error: ${error.message}`)
      
      if (error.code) console.error(`Code: ${error.code}`)
      if (error.command) console.error(`Command: ${error.command}`)
      if (error.response) console.error(`Response: ${error.response}`)
      
      await transporter.close()
    }
  }
  
  console.error('\n❌ All connection attempts failed!')
  console.log('\nPossible issues:')
  console.log('1. Network connectivity from Railway to Brevo SMTP servers')
  console.log('2. Firewall blocking outbound SMTP connections on port 587')
  console.log('3. Invalid Brevo API credentials')
  console.log('4. Brevo account limitations or restrictions')
  
  process.exit(1)
}

// Run the test
console.log('MarvelCDC Email Configuration Test')
console.log('===================================')
console.log('Usage: npm run test-email [optional-test-email]')
console.log('Example: npm run test-email admin@example.com\n')

testEmailConnection().catch(console.error)