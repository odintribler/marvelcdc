#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as dns from 'dns'
import * as net from 'net'
import nodemailer from 'nodemailer'

const execAsync = promisify(exec)
const dnsResolve4 = promisify(dns.resolve4)
const dnsResolveMx = promisify(dns.resolveMx)

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

const BREVO_SMTP_HOST = 'smtp-relay.brevo.com'
const BREVO_SMTP_PORT = 587

async function runDiagnostics() {
  console.log('🔍 MarvelCDC Email Diagnostics')
  console.log('================================\n')

  // 1. Check DNS Resolution
  console.log('1️⃣  DNS Resolution Tests')
  console.log('-------------------------')
  
  try {
    // Check general DNS resolution
    console.log('Testing DNS resolution for smtp-relay.brevo.com...')
    const addresses = await dnsResolve4(BREVO_SMTP_HOST)
    console.log(`✅ Resolved to IP addresses: ${addresses.join(', ')}`)
    
    // Test connection to each IP
    for (const ip of addresses) {
      await testTcpConnection(ip, BREVO_SMTP_PORT)
    }
  } catch (error: any) {
    console.error(`❌ DNS resolution failed: ${error.message}`)
    console.log('\nPossible issues:')
    console.log('- DNS server not reachable from Railway container')
    console.log('- Custom DNS settings blocking resolution')
    console.log('- Network policy blocking DNS queries')
  }

  // 2. Check your domain's MX records (if applicable)
  console.log('\n2️⃣  Domain MX Records Check')
  console.log('---------------------------')
  
  if (process.env.FROM_EMAIL) {
    const domain = process.env.FROM_EMAIL.split('@')[1]
    if (domain) {
      try {
        console.log(`Checking MX records for ${domain}...`)
        const mxRecords = await dnsResolveMx(domain)
        console.log('MX Records:')
        mxRecords.sort((a, b) => a.priority - b.priority).forEach(mx => {
          console.log(`  Priority ${mx.priority}: ${mx.exchange}`)
        })
        console.log('✅ MX records found')
      } catch (error: any) {
        console.log(`⚠️  No MX records found for ${domain}`)
        console.log('This might affect email deliverability but won\'t prevent sending')
      }
    }
  }

  // 3. Test Network Connectivity
  console.log('\n3️⃣  Network Connectivity Test')
  console.log('------------------------------')
  
  try {
    // Test basic network connectivity
    console.log('Testing outbound connectivity...')
    const { stdout: pingResult } = await execAsync(`ping -c 3 8.8.8.8`).catch(() => ({ stdout: 'Ping failed' }))
    if (pingResult.includes('packets transmitted')) {
      console.log('✅ Basic network connectivity OK')
    } else {
      console.log('⚠️  Basic network connectivity issues detected')
    }
  } catch (error) {
    console.log('⚠️  Cannot test ping (might be blocked in container)')
  }

  // 4. Test SMTP Connection with detailed logging
  console.log('\n4️⃣  SMTP Connection Test')
  console.log('------------------------')
  
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_LOGIN_EMAIL || !process.env.FROM_EMAIL) {
    console.error('❌ Missing required environment variables!')
    console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? 'Set' : 'Missing'}`)
    console.log(`BREVO_LOGIN_EMAIL: ${process.env.BREVO_LOGIN_EMAIL ? 'Set' : 'Missing'}`)
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL ? 'Set' : 'Missing'}`)
    return
  }

  console.log('Creating SMTP transporter with extended timeouts...')
  const transporter = nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: BREVO_SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.BREVO_LOGIN_EMAIL,
      pass: process.env.BREVO_API_KEY,
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 60000,
    socketTimeout: 60000,
    logger: true,
    debug: true,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (for testing only)
      ciphers: 'SSLv3'
    }
  })

  try {
    console.log('Attempting SMTP connection...')
    const startTime = Date.now()
    
    await transporter.verify()
    
    const duration = Date.now() - startTime
    console.log(`✅ SMTP connection successful! (took ${duration}ms)`)
    
    // Try to send a test email if provided
    if (process.argv[2]) {
      const testEmail = process.argv[2]
      console.log(`\n5️⃣  Sending Test Email to ${testEmail}`)
      console.log('--------------------------------')
      
      const result = await transporter.sendMail({
        from: `"MarvelCDC Diagnostics" <${process.env.FROM_EMAIL}>`,
        to: testEmail,
        subject: 'MarvelCDC Email Diagnostic Test',
        text: `This is a diagnostic test email from MarvelCDC.
        
Sent from: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
Timestamp: ${new Date().toISOString()}
SMTP Host: ${BREVO_SMTP_HOST}
Connection time: ${duration}ms`,
        html: `
          <h2>MarvelCDC Email Diagnostic Test</h2>
          <p>This is a diagnostic test email from MarvelCDC.</p>
          <ul>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            <li><strong>SMTP Host:</strong> ${BREVO_SMTP_HOST}</li>
            <li><strong>Connection time:</strong> ${duration}ms</li>
          </ul>
        `,
      })
      
      console.log(`✅ Test email sent successfully!`)
      console.log(`Message ID: ${result.messageId}`)
    }
  } catch (error: any) {
    console.error(`❌ SMTP connection failed: ${error.message}`)
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔥 Connection Timeout - Possible causes:')
      console.log('1. Railway/hosting provider blocking port 587')
      console.log('2. DNS changes affecting routing')
      console.log('3. Firewall rules blocking outbound SMTP')
      console.log('4. Brevo IP not whitelisted in production environment')
      
      console.log('\n💡 Suggested fixes:')
      console.log('1. Check Railway dashboard for any network policies')
      console.log('2. Verify DNS settings haven\'t blocked SMTP traffic')
      console.log('3. Try using port 2525 instead of 587')
      console.log('4. Contact Railway support about SMTP restrictions')
      console.log('5. Consider using Brevo\'s HTTP API instead of SMTP')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔥 Connection Refused - The SMTP server is actively refusing connections')
      console.log('Check if Brevo service is operational')
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔥 DNS resolution failed - Cannot resolve smtp-relay.brevo.com')
      console.log('Check DNS configuration in production environment')
    }
    
    if (error.response) {
      console.log(`\nSMTP Response: ${error.response}`)
    }
  } finally {
    await transporter.close()
  }

  // 6. Alternative port test
  console.log('\n6️⃣  Testing Alternative SMTP Ports')
  console.log('-----------------------------------')
  
  const alternativePorts = [2525, 25, 465]
  for (const port of alternativePorts) {
    console.log(`Testing port ${port}...`)
    const success = await testTcpConnection(BREVO_SMTP_HOST, port)
    if (success) {
      console.log(`✅ Port ${port} is reachable - consider using this port`)
    }
  }

  console.log('\n✨ Diagnostics Complete!')
}

async function testTcpConnection(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = setTimeout(() => {
      socket.destroy()
      console.log(`  ❌ Port ${port} on ${host}: Connection timeout`)
      resolve(false)
    }, 5000)

    socket.on('connect', () => {
      clearTimeout(timeout)
      console.log(`  ✅ Port ${port} on ${host}: Reachable`)
      socket.destroy()
      resolve(true)
    })

    socket.on('error', (err: any) => {
      clearTimeout(timeout)
      console.log(`  ❌ Port ${port} on ${host}: ${err.code || err.message}`)
      resolve(false)
    })

    socket.connect(port, host)
  })
}

// Run diagnostics
console.log('Usage: npm run diagnose-email [optional-test-email]')
console.log('Example: npm run diagnose-email admin@example.com\n')

runDiagnostics().catch(console.error)