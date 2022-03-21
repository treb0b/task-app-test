// mocking sendgrid module prevents from sending emails on user signup
module.exports = {
	setApiKey() {},
	send() {},
};
