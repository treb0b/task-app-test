import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
// 	to: "rarseniuk@gmail.com",
// 	from: "rarseniuk@cybera.pl",
// 	subject: "This is my first creation!",
// 	text: "I hope this one actually gets to you",
// });

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "rarseniuk@cybera.pl",
		subject: "Thanks for joining in!",
		text: `Welcome to the app ${name}, please let me know how you get along with the app`,
	});
};

const sendGoodbyeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "rarseniuk@cybera.pl",
		subject: "Sorry to see you go...",
		text: `Dear ${name}, we're sorry to see you go - is there anything we could do to keep you with us?`,
	});
};

export { sendWelcomeEmail, sendGoodbyeEmail };
