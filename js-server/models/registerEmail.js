require('dotenv').config();

function registerEmailGetPlainTextContent(username, resetToken) {
	return `
    Hi ${username}!

    You've been invited to join HDAVAIL. Click the following link to set your password:

    http://localhost:5173/setpass?token=${resetToken}

    Thank you for joining HDAVAIL!

    The HDAVAIL Team
    `;
}

function registerEmailGetHtmlContent(username, resetToken) {
	return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to HDAVAIL, ${username}!</h2>
        <p>You've been invited to join <strong>HDAVAIL</strong>. We're excited to have you on board!</p>
        <p>Please click the button below to complete your registration and set your password.</p>
        <a 
            href="http://localhost:5173/setpass?token=${resetToken}" 
            style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Set Your Password
        </a>
        <p style="margin-top: 20px;">If the button doesn't work, you can also use the following link:</p>
        <p><a href="http://localhost:5173/setpass?token=${resetToken}">http://localhost:5173/setpass?token=${resetToken}</a></p>
        <p>Thank you for joining HDAVAIL!</p>
        <p>The HDAVAIL Team</p>
    </div>
    `;
}

module.exports = {
	registerEmailGetPlainTextContent,
	registerEmailGetHtmlContent,
};
