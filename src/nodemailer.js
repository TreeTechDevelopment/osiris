const nodemailer = require('nodemailer');
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const sendEmail = (data, callbackSuccess) => {
    const oauth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET, 
        "https://developers.google.com/oauthplayground" 
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const accessToken = oauth2Client.getAccessToken()
    const fileName = `venta_${data.date.replace(/\//g, '-')}.pdf`
    const mailOptions = {
        from: 'Kaffeedehigo',
        to: "os.kardavid70@gmail@gmail.com",
        subject: 'Nueva venta generada',
        generateTextFromHTML: true,
        text: "Nueva venta generada",
        attachments: [{
            filename: fileName,
            path: data.path,
            contentType: 'application/pdf'
        }]
    }
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "cafedehigo@gmail.com", 
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken
        },
        tls:{ rejectUnauthorized: false }
   }); 
   smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) { return console.log(err) }
        callbackSuccess(fileName, data.path)
        smtpTransport.close()
    });
}

module.exports = {
    sendEmail
}