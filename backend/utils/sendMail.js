const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Professional HTML email template
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }
      .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .header { background-color: #3321c8; padding: 30px 40px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
      .header p { color: #c5c1ff; margin: 6px 0 0; font-size: 14px; }
      .body { padding: 40px; color: #333333; }
      .body p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
      .btn-wrapper { text-align: center; margin: 30px 0; }
      .btn {
        display: inline-block;
        background-color: #3321c8;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 36px;
        border-radius: 6px;
        font-size: 15px;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
      .note { font-size: 13px; color: #888888; }
      .link-fallback { word-break: break-all; color: #3321c8; font-size: 13px; }
      .footer { background-color: #f9f9f9; padding: 20px 40px; text-align: center; }
      .footer p { font-size: 12px; color: #aaaaaa; margin: 4px 0; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>E-Shop</h1>
        <p>Your trusted multivendor marketplace</p>
      </div>
      <div class="body">
        <p>Hi <strong>${options.name || "there"}</strong>,</p>
        <p>${options.message}</p>

        ${
          options.activationUrl
            ? `
        <div class="btn-wrapper">
          <a href="${options.activationUrl}" class="btn">Activate My Account</a>
        </div>
        <hr class="divider" />
        <p class="note">If the button doesn't work, copy and paste this link into your browser:</p>
        <p class="link-fallback">${options.activationUrl}</p>
        <hr class="divider" />
        <p class="note">This link will expire in <strong>2 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
        `
            : ""
        }
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} E-Shop. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"E-Shop" <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // plain text fallback
    html: htmlTemplate,   // beautiful HTML version
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
