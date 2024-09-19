require('dotenv').config();

function forgotPasswordEmailGetPlainTextContent(username, resetToken) {
	return `
    Hi ${username}!

		It seems like you requested to reset your password for HDAVAIL. Click the following link to reset it:

		http://localhost:5173/resetPassword?token=${resetToken}

		If you didn't request this, please ignore this email.

		Thank you!

		The HDAVAIL Team
    `;
}

function forgotPasswordEmailGetHtmlContent(username, resetToken) {
	return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">Reset Your HDAVAIL Password</h2>
                <p>Hi <strong>${username}</strong>,</p>
                <p>We received a request to reset your password for <strong>HDAVAIL</strong>. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a 
                        href="http://localhost:5173/resetPassword?token=${resetToken}" 
                        style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Reset Your Password
                    </a>
                </div>
                <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
                <p><a href="http://localhost:5173/resetPassword?token=${resetToken}" style="color: #4CAF50;">http://localhost:5173/resetPassword?token=${resetToken}</a></p>
                <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
                <p>Thank you,</p>
                <p>The <strong>HDAVAIL</strong> Team</p>
            </div>
    `;
}

module.exports = {
	forgotPasswordEmailGetPlainTextContent,
	forgotPasswordEmailGetHtmlContent,
};
