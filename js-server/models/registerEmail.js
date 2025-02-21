require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

function registerEmailGetPlainTextContent(username, resetToken) {
	return `
    Hi ${username}!

    You've been invited to join the beta testing of R3DSYS. Click the following link to set your password:

    ${process.env.EMAIL_BASE_URL}/setpass?token=${resetToken}

    Thank you for participating!
    `;
}

function registerEmailGetHtmlContent(username, resetToken) {
	return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to R3DSYS, ${username}!</h2>
        <p>You've been invited to join the beta version of <strong>R3DSYS</strong>. We're excited to have you on board!</p>
        <p>Please click the button below to complete your registration and set your password.</p>
        <a 
            href="${process.env.EMAIL_BASE_URL}/setpass?token=${resetToken}" 
            style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Register
        </a>
        <p style="margin-top: 20px;">If the button doesn't work, you can also use the following link:</p>
        <p><a href="${process.env.EMAIL_BASE_URL}/setpass?token=${resetToken}">${process.env.EMAIL_BASE_URL}/setpass?token=${resetToken}</a></p>
        <p>Thank you for participating in the beta!</p>
        <p>R3DSYS</p>
    </div>
    `;
}

module.exports = {
	registerEmailGetPlainTextContent,
	registerEmailGetHtmlContent,
};
