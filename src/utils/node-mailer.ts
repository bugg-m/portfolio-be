import { createTransport, TransportOptions, SentMessageInfo } from 'nodemailer';

interface EmailConfig {
  recipientEmail: string;
  subject: EmailSubject;
  template: EmailTemplate;
  templateData: EmailTemplateData;
  from?: string;
}

enum EmailTemplate {
  WELCOME = 'welcome',
  CONFIRMATION = 'confirmation',
  PASSWORD_RESET = 'password-reset',
  NEW_MESSAGE_FROM = 'new-message-from',
  CUSTOM = 'custom',
}

enum EmailSubject {
  REACHING_OUT = 'Thanks for reaching out! 👋',
  CONFIRM_ACCOUNT = 'Please Confirm Your Account',
  RESET_PASSWORD = 'Password Reset Request',
  NEW_MESSAGE = 'New message',
}

interface CustomTemplateData {
  recipientName?: string;
  htmlContent: string;
  textContent: string;
  [key: string]: string | number | boolean | undefined;
}

interface ConfirmationTemplateData {
  recipientName?: string;
  confirmationLink: string;
  [key: string]: string | number | boolean | undefined;
}

interface NewMessageTemplateData {
  recipientName: string;
  recipientEmail: string;
  recipientMessage: string;
}

interface PasswordResetTemplateData {
  recipientName?: string;
  resetLink: string;
  expiryTime: string;
  [key: string]: string | number | boolean | undefined;
}

interface WelcomeTemplateData {
  recipientName?: string;
  [key: string]: string | number | boolean | undefined;
}

type EmailTemplateData =
  | WelcomeTemplateData
  | ConfirmationTemplateData
  | PasswordResetTemplateData
  | CustomTemplateData
  | NewMessageTemplateData;

class EmailService {
  private transporter;
  private portfolioUrl: string;
  private myName: string;
  private myEmail: string;

  constructor() {
    this.portfolioUrl = process.env.FRONTEND_URL ?? '';
    this.myName = `${process.env.MY_FIRST_NAME} ${process.env.MY_LAST_NAME}`;
    this.myEmail = process.env.NODE_MAILER_EMAIL ?? 'echobuggm@gmail.com';

    this.transporter = createTransport({
      host: `${process.env.NODE_MAILER_TRANSPORT_HOST}`,
      port: Number(process.env.NODE_MAILER_TRANSPORT_PORT),
      secure: true,
      auth: {
        user: this.myEmail,
        pass: process.env.NODE_MAILER_EMAIL_PASSWORD ?? '',
      },
    } as TransportOptions);
  }

  async sendEmail(config: EmailConfig): Promise<SentMessageInfo> {
    const { recipientEmail, subject, template, templateData, from } = config;

    const { htmlContent, textContent } = this.generateEmailContent(template, {
      ...templateData,
    });

    const info = await this.transporter.sendMail({
      from: from || `"${this.myName}" <${this.myEmail}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    return info;
  }

  private generateEmailContent(
    template: EmailTemplate,
    data: EmailTemplateData
  ): { htmlContent: string; textContent: string } {
    const currentYear = new Date().getFullYear();

    switch (template) {
      case EmailTemplate.WELCOME: {
        return this.getWelcomeEmailContent(data.recipientName);
      }
      case EmailTemplate.CONFIRMATION: {
        if (!('confirmationLink' in data)) {
          throw new Error('confirmationLink is required for confirmation emails');
        }
        return this.getConfirmationEmailContent(data as ConfirmationTemplateData);
      }
      case EmailTemplate.PASSWORD_RESET: {
        if (!('resetLink' in data) || !('expiryTime' in data)) {
          throw new Error('resetLink and expiryTime are required for password reset emails');
        }
        return this.getPasswordResetEmailContent(data as PasswordResetTemplateData);
      }
      case EmailTemplate.NEW_MESSAGE_FROM: {
        return this.getNewMessageEmailContent(data as NewMessageTemplateData);
      }
      case EmailTemplate.CUSTOM: {
        if (!('htmlContent' in data) || !('textContent' in data)) {
          throw new Error('htmlContent and textContent are required for custom emails');
        }
        const customData = data as CustomTemplateData;
        return {
          htmlContent: this.replaceVariables(customData.htmlContent, {
            ...data,
            portfolioUrl: this.portfolioUrl,
            myName: this.myName,
            currentYear: currentYear.toString(),
          }),
          textContent: this.replaceVariables(customData.textContent, {
            ...data,
            portfolioUrl: this.portfolioUrl,
            myName: this.myName,
            currentYear: currentYear.toString(),
          }),
        };
      }
      default: {
        const exhaustiveCheck: never = template;
        throw new Error(`Template ${String(exhaustiveCheck)} not found`);
      }
    }
  }

  private replaceVariables(
    template: string,
    data: Record<string, string | number | boolean | undefined>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private getWelcomeEmailContent(recipientName?: string): {
    htmlContent: string;
    textContent: string;
  } {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome from ${this.myName}'s Portfolio</title>
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
          <a href="${this.portfolioUrl}" class="logo">${this.myName}</a>
        </div>
        
        <div class="content">
          <h2>Hello ${recipientName ? recipientName : 'there'}!</h2>
          
          <p>Thank you for reaching out through my portfolio website. I'm excited to connect with you and explore potential opportunities to work together.</p>
          
          <p>I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
          
          <p>In the meantime, feel free to explore more of my work and projects on my portfolio website:</p>
          
          <center>
            <a href="${this.portfolioUrl}" class="button">View My Portfolio</a>
          </center>
          
          <p>If you have any urgent questions, you can reply directly to this email.</p>
          
          <p>Looking forward to our conversation!</p>
          
          <p>
            Best regards,<br>
            ${this.myName}
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
      
      In the meantime, feel free to explore more of my work and projects on my portfolio website: ${this.portfolioUrl}
      
      If you have any urgent questions, you can reply directly to this email.
      
      Looking forward to our conversation!
      
      Best regards,
      ${this.myName}
      
      © ${new Date().getFullYear()} BUGG. All rights reserved.
    `;

    return { htmlContent, textContent };
  }

  private getNewMessageEmailContent(data?: NewMessageTemplateData): {
    htmlContent: string;
    textContent: string;
  } {
    const htmlContent = `
     <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>New Message Received from ${data?.recipientName} via Portfolio</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .content {
              padding: 20px 0;
            }
            .content h2 {
              color: #4ccd99;
            }
            .content p {
              margin-bottom: 1rem;
            }
            .sender-info {
              background-color: #f9f9f9;
              border: 1px solid #eee;
              padding: 10px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 14px;
              color: #777;
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
          <div class="content">
            <h2>Hello,</h2>
            <p>
              You have received a new message via your portfolio website. Below are the details:
            </p>
            <div class="sender-info">
              <p><strong>Sender Name:</strong> ${data?.recipientName}</p>
              <p><strong>Sender Email:</strong> ${data?.recipientEmail}</p>
              <p><strong>Message:</strong><br>${data?.recipientMessage}</p>
            </div>
            <p>
              Please review this message and respond at your earliest convenience.
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
      Hello ${this.myName}!
      
      You have received a new message via your portfolio website.
      
      © ${new Date().getFullYear()} BUGG. All rights reserved.
    `;

    return { htmlContent, textContent };
  }

  private getConfirmationEmailContent(data: ConfirmationTemplateData): {
    htmlContent: string;
    textContent: string;
  } {
    const { recipientName, confirmationLink } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Account - ${this.myName}'s Portfolio</title>
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
          <a href="${this.portfolioUrl}" class="logo">${this.myName}</a>
        </div>
        
        <div class="content">
          <h2>Hello ${recipientName ? recipientName : 'there'}!</h2>
          
          <p>Thank you for creating an account. To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
          
          <center>
            <a href="${confirmationLink}" class="button">Confirm Email Address</a>
          </center>
          
          <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          
          <p>${confirmationLink}</p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account, please ignore this email.</p>
          
          <p>
            Best regards,<br>
            ${this.myName}
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
      
      Thank you for creating an account. To complete your registration and activate your account, please confirm your email address by visiting the link below:
      
      ${confirmationLink}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create an account, please ignore this email.
      
      Best regards,
      ${this.myName}
      
      © ${new Date().getFullYear()} BUGG. All rights reserved.
    `;

    return { htmlContent, textContent };
  }

  private getPasswordResetEmailContent(data: PasswordResetTemplateData): {
    htmlContent: string;
    textContent: string;
  } {
    const { recipientName, resetLink, expiryTime } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - ${this.myName}'s Portfolio</title>
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
          .warning {
            color: #e74c3c;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <a href="${this.portfolioUrl}" class="logo">${this.myName}</a>
        </div>
        
        <div class="content">
          <h2>Hello ${recipientName ? recipientName : 'there'}!</h2>
          
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>
          
          <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          
          <p>${resetLink}</p>
          
          <p class="warning">This link will expire in ${expiryTime} for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email or contact us if you have any concerns.</p>
          
          <p>
            Best regards,<br>
            ${this.myName}
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
      
      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
      
      To reset your password, please visit the link below:
      
      ${resetLink}
      
      IMPORTANT: This link will expire in ${expiryTime} for security reasons.
      
      If you didn't request a password reset, please ignore this email or contact us if you have any concerns.
      
      Best regards,
      ${this.myName}
      
      © ${new Date().getFullYear()} BUGG. All rights reserved.
    `;

    return { htmlContent, textContent };
  }
}

export { EmailService, EmailTemplate, EmailSubject, type EmailConfig, type EmailTemplateData };
