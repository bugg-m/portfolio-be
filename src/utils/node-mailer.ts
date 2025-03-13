import { createTransport, TransportOptions, SentMessageInfo } from 'nodemailer';

/**
 * Sends a customized welcome email to new contacts
 * @param recipientEmail - The email address of the recipient
 * @param recipientName - The name of the recipient
 * @param subject - Subject for customizing the email
 * @returns Email sending result information
 */
async function sendWelcomeEmail({
  recipientEmail,
  recipientName,
  subject = 'Thanks for reaching out! 👋',
}: {
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
}): Promise<SentMessageInfo> {
  const portfolioUrl = process.env.FRONTEND_URL ?? '';
  const myName = `${process.env.MY_FIRST_NAME} ${process.env.MY_LAST_NAME}`;

  const transporter = createTransport({
    host: `${process.env.NODE_MAILER_TRANSPORT_HOST}`,
    port: process.env.NODE_MAILER_TRANSPORT_PORT,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL ?? '',
      pass: process.env.NODE_MAILER_EMAIL_PASSWORD ?? '',
    },
  } as TransportOptions);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome from ${myName}'s Portfolio</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4ccd99;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4ccd99;
          text-decoration: none;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #777;
        }
        .button {
          display: inline-block;
          background-color: #3abf81;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          margin: 0 10px;
          color: #4ccd99;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <a href="${portfolioUrl}" class="logo">${myName}</a>
      </div>
      
      <div class="content">
        <h2>Hello ${recipientName ? recipientName : 'there'}!</h2>
        
        <p>Thank you for reaching out through my portfolio website. I'm excited to connect with you and explore potential opportunities to work together.</p>
        
        <p>I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
        
        <p>In the meantime, feel free to explore more of my work and projects on my portfolio website:</p>
        
        <center>
          <a href="${portfolioUrl}" class="button">View My Portfolio</a>
        </center>
        
        <p>If you have any urgent questions, you can reply directly to this email.</p>
        
        <p>Looking forward to our conversation!</p>
        
        <p>
          Best regards,<br>
          ${myName}
        </p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} BUGG. All rights reserved.</p>
        
        <div class="social-links">
          <a href="${process.env.LINKEDIN_URL}">LinkedIn</a> |
          <a href="${process.env.GITHUB_URL}">GitHub</a> |
          <a href="${process.env.WHATSAPP}">WhatsApp</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Hello ${recipientName ? recipientName : 'there'}!
    
    Thank you for reaching out through my portfolio website. I'm excited to connect with you and explore potential opportunities to work together.
    
    I've received your message and will get back to you as soon as possible, usually within 24-48 hours.
    
    In the meantime, feel free to explore more of my work and projects on my portfolio website: ${portfolioUrl}
    
    If you have any urgent questions, you can reply directly to this email.
    
    Looking forward to our conversation!
    
    Best regards,
    ${myName}
    
    © ${new Date().getFullYear()} BUGG. All rights reserved.
  `;

  const info = await transporter.sendMail({
    from: `"${myName}" <${process.env.NODE_MAILER_EMAIL ?? 'echobuggm@gmail.com'}>`,
    to: recipientEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  });

  return info;
}

export { sendWelcomeEmail };
