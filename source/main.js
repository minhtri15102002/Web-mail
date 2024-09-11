require('dotenv').config()
const express = require('express')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const EmailRouter = require('./routers/EmailRouter')
const AccountRouter = require('./routers/AccountRouter')
const bodyParser = require('body-parser')
const db = require('./db')
const { Server } = require('socket.io');

const app = express()
const http = require('http')
const httpServer = http.createServer(app);


app.set('view engine', 'ejs')
app.use(cookieParser('123'))
app.use(session({ cookie: { maxAge: 1000 * 60 * 20 * 10000 } }));
app.use(flash());
app.use(express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/login');
    }
    const user = req.session.user;
    const userEmail = user.Email;

    db.query('SELECT * FROM email WHERE `to` = ?', [userEmail], (error, results) => {
        if (error) {
            throw error;
        }

        const emails = results;
        res.render('index', { user, emails });
    });
});


app.use('/account', AccountRouter)
app.use('/', EmailRouter)

const port = process.env.PORT || 8080;
httpServer.listen(port, () => console.log(`http://localhost:${port}`));

const io = new Server(httpServer)
io.on('connection', (client) => {
    console.log('Connected')

    client.on('send-email', async(data) => {
        let { sender, from, to, cc, bcc, subject, content, sendAt, starred, isRead } = data;

        if (from === to) {
            sender = 'me';
        }
        // Code to search for email recipient and send email goes here
        db.query('SELECT id, Email, Name FROM account WHERE Email = ?', to, function(error, results) {
            if (error) throw error;

            // If recipient not found, send error message back to client
            if (results.length === 0) {
                client.emit('email-error', 'Recipient not found');
                return;
            }

            client.emit('email-sent', 'Email sent successfully');

            db.query('INSERT INTO Email (sender, `from`, `to`, cc, bcc, subject, content, sendAt, starred, isRead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [sender, from, results[0].Email, cc, bcc, subject, content, sendAt, starred, isRead], (error, results) => {
                if (error) throw error;
            });
        });

    });
})