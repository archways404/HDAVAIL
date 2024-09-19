const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(toEmail, subject, plainTextContent, htmlContent) {
	const senderEmail = process.env.SENDER_EMAIL;
	const senderPassword = process.env.SENDER_PASSWORD;

	let transporter = nodemailer.createTransport({
		host: 'mail.gmx.com',
		port: 465,
		secure: true,
		auth: {
			user: senderEmail,
			pass: senderPassword,
		},
	});

	let mailOptions = {
		from: senderEmail,
		to: toEmail,
		subject: subject,
		text: plainTextContent,
		html: htmlContent,
		encoding: 'base64',
	};

	try {
		let info = await transporter.sendMail(mailOptions);
		console.log('Email sent: ' + info.response);
		return info.response;
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
}

module.exports = { sendEmail };
