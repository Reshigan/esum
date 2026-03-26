/**
 * ESUM Energy Trading Platform - Notifications Worker
 * Email, push, and in-app notification delivery
 */

interface Env {
  DB: D1Database;
  NOTIFICATION_QUEUE: Queue;
  DOCUMENTS: R2Bucket;
  RESEND_API_KEY: string;
}

interface Notification {
  id: string;
  recipient_org_id: string;
  recipient_user_id: string;
  notification_type: string;
  channel: string;
  title: string;
  content: string;
  metadata?: any;
  sent_at: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const emailTemplates: Record<string, (data: any) => string> = {
  welcome: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Outfit', Arial, sans-serif; background: #F8FAFC; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #00A86B 0%, #007A54 100%); padding: 40px; text-align: center; }
    .logo { color: white; font-size: 32px; font-weight: bold; }
    .content { padding: 40px; }
    h1 { color: #0A111E; margin: 0 0 20px; }
    p { color: #64748B; line-height: 1.6; }
    .button { display: inline-block; background: #00A86B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #F8FAFC; padding: 20px; text-align: center; color: #94A3B8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ESUM</div>
      <p style="color: white; margin: 10px 0 0;">Energy Trading Platform</p>
    </div>
    <div class="content">
      <h1>Welcome to ESUM, ${data.name}!</h1>
      <p>Your organisation <strong>${data.organisation}</strong> has been successfully registered on the ESUM Energy Trading Platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Trade green energy contracts</li>
        <li>Buy and sell carbon credits</li>
        <li>Access AI-powered scenario planning</li>
        <li>Monitor real-time grid data</li>
      </ul>
      <a href="https://app.esum.energy/login" class="button">Get Started</a>
      <p>If you have any questions, contact us at support@esum.energy</p>
    </div>
    <div class="footer">
      © 2026 ESUM Energy Trading Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
  `,

  trade_executed: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #F8FAFC; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #00A86B; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .trade-details { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }
    .footer { padding: 20px; text-align: center; color: #94A3B8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Trade Executed ✓</h1>
    </div>
    <div class="content">
      <p>Your trade has been successfully executed on the ESUM platform.</p>
      <div class="trade-details">
        <div class="detail-row"><span>Trade ID:</span><strong>${data.trade_id}</strong></div>
        <div class="detail-row"><span>Instrument:</span><span>${data.instrument}</span></div>
        <div class="detail-row"><span>Volume:</span><strong>${data.volume_mwh} MWh</strong></div>
        <div class="detail-row"><span>Price:</span><strong>R ${data.unit_price_zar}/MWh</strong></div>
        <div class="detail-row"><span>Total Value:</span><strong>R ${data.total_value_zar.toFixed(2)}</strong></div>
        <div class="detail-row"><span>Settlement Date:</span><span>${data.settlement_date}</span></div>
      </div>
      <p>A contract will be generated and sent to both parties shortly.</p>
    </div>
    <div class="footer">
      ESUM Energy Trading Platform
    </div>
  </div>
</body>
</html>
  `,

  auction_closing: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #F8FAFC; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #C9A12B; color: white; padding: 30px; text-align: center; }
    .countdown { font-size: 36px; font-weight: bold; color: #00A86B; text-align: center; padding: 20px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #00A86B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Auction Closing Soon ⏰</h1>
    </div>
    <div class="content">
      <p>The following auction will close soon:</p>
      <h2 style="color: #0A111E;">${data.auction_name}</h2>
      <div class="countdown">${data.time_remaining}</div>
      <p><strong>Instrument:</strong> ${data.instrument}</p>
      <p><strong>Current bids:</strong> ${data.total_bids}</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://app.esum.energy/auctions/${data.auction_id}" class="button">Place Your Bid</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  kyc_approved: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #F8FAFC; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #00A86B; color: white; padding: 30px; text-align: center; }
    .badge { display: inline-block; background: white; color: #00A86B; padding: 8px 24px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #00A86B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">KYC Approved ✓</h1>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <div class="badge">VERIFIED</div>
      </div>
      <p>Great news! Your organisation's KYC verification has been <strong>approved</strong>.</p>
      <p>You now have full access to all ESUM platform features:</p>
      <ul>
        <li>Trade energy instruments</li>
        <li>Participate in auctions</li>
        <li>Execute OTC negotiations</li>
        <li>Access carbon credit marketplace</li>
      </ul>
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://app.esum.energy/dashboard" class="button">Go to Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  settlement_due: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #F8FAFC; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1A73E8; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .amount { font-size: 32px; color: #00A86B; font-weight: bold; text-align: center; margin: 20px 0; }
    .details { background: #F8FAFC; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Settlement Due</h1>
    </div>
    <div class="content">
      <p>A settlement is due for the following contract:</p>
      <div class="details">
        <p><strong>Contract:</strong> ${data.contract_id}</p>
        <p><strong>Period:</strong> ${data.period}</p>
        <p><strong>Volume:</strong> ${data.volume_mwh} MWh</p>
        <div class="amount">R ${data.amount.toFixed(2)}</div>
        <p><strong>Due Date:</strong> ${data.due_date}</p>
      </div>
      <p style="margin-top: 20px;">Please ensure payment is made by the due date to avoid penalties.</p>
    </div>
  </div>
</body>
</html>
  `
};

// ============================================================================
// NOTIFICATION DELIVERY
// ============================================================================

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  env: Env
): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ESUM Platform <noreply@esum.energy>',
        to,
        subject,
        html
      })
    });
    
    if (!response.ok) {
      console.error('Email send failed:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function createInAppNotification(
  recipient_org_id: string,
  recipient_user_id: string,
  notification_type: string,
  title: string,
  content: string,
  metadata: any,
  env: Env
): Promise<Notification> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const notification: Notification = {
    id,
    recipient_org_id,
    recipient_user_id,
    notification_type,
    channel: 'in_app',
    title,
    content,
    metadata,
    sent_at: now
  };
  
  await env.DB.prepare(`
    INSERT INTO notifications (id, recipient_org_id, recipient_user_id, notification_type, channel, title, content, metadata, sent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, recipient_org_id, recipient_user_id, notification_type, 'in_app',
    title, content, JSON.stringify(metadata), now, now
  ).run();
  
  return notification;
}

async function processNotification(
  notificationData: any,
  env: Env
): Promise<void> {
  const { type, recipient_org_id, recipient_user_id, data } = notificationData;
  const now = new Date().toISOString();
  
  // Get user email
  const user = await env.DB.prepare(`
    SELECT u.email, u.name, o.name as org_name
    FROM users u
    JOIN organisations o ON u.organisation_id = o.id
    WHERE u.id = ?
  `).bind(recipient_user_id).first();
  
  if (!user) return;
  
  // Create in-app notification
  let title = 'Notification';
  let content = '';
  let templateName = 'welcome';
  
  switch (type) {
    case 'trade_executed':
      title = 'Trade Executed';
      content = `Your trade for ${data.volume_mwh} MWh has been executed successfully.`;
      templateName = 'trade_executed';
      break;
    case 'order_filled':
      title = 'Order Filled';
      content = `Your order has been completely filled.`;
      break;
    case 'auction_closing':
      title = 'Auction Closing Soon';
      content = `The auction for ${data.instrument} closes in ${data.time_remaining}.`;
      templateName = 'auction_closing';
      break;
    case 'settlement_due':
      title = 'Settlement Due';
      content = `A settlement of R ${data.amount} is due on ${data.due_date}.`;
      templateName = 'settlement_due';
      break;
    case 'kyc_approved':
      title = 'KYC Approved';
      content = 'Your organisation KYC verification has been approved.';
      templateName = 'kyc_approved';
      break;
    case 'kyc_rejected':
      title = 'KYC Requires Resubmission';
      content = `Your KYC submission was rejected: ${data.reason}`;
      break;
    case 'welcome':
      title = 'Welcome to ESUM';
      content = `Welcome to the ESUM Energy Trading Platform, ${user.name}!`;
      templateName = 'welcome';
      break;
  }
  
  await createInAppNotification(
    recipient_org_id,
    recipient_user_id,
    type,
    title,
    content,
    data,
    env
  );
  
  // Send email
  const template = emailTemplates[templateName] || emailTemplates.welcome;
  const html = template({ ...data, name: user.name, organisation: user.org_name });
  
  await sendEmail(user.email, title, html, env);
}

// ============================================================================
// WORKER HANDLER
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Send test email
      if (path === '/api/notifications/test' && request.method === 'POST') {
        const body = await request.json();
        const html = emailTemplates.welcome({
          name: 'Test User',
          organisation: 'Test Org'
        });
        
        const sent = await sendEmail(body.email, 'Test Email', html, env);
        
        return Response.json({
          success: sent,
          message: sent ? 'Email sent' : 'Email failed'
        });
      }
      
      // Get unread count
      if (path === '/api/notifications/unread-count' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        
        const { count } = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM notifications
          WHERE recipient_user_id = ? AND read_at IS NULL
        `).bind(userId!).first();
        
        return Response.json({
          success: true,
          data: { unread_count: count }
        });
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('Notifications error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  },
  
  // Queue consumer
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processNotification(message.body, env);
        message.ack();
      } catch (error) {
        console.error('Notification processing error:', error);
        message.retry();
      }
    }
  }
};
