const express = require('express')
const app = express.Router()
const fs = require('fs')
const multer = require('multer');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const db = require('../db')
const { Vonage } = require('@vonage/server-sdk')
app.use(express.urlencoded())

const OTP = Math.floor(100000 + Math.random() * 900000);
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const destinationPath = './uploads';
        fs.mkdirSync(destinationPath, { recursive: true });
        cb(null, destinationPath)
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

const uploadAvatar = multer({ storage: storage });



app.get('/security', (req, res) => {
    const user = req.session.user
    const thongbao = req.flash('thongbao') || ''
    db.query('SELECT * FROM account WHERE Email = ?', [user.Email], (error, results) => {
        if (error) {
            throw error
        }

        // Khi dữ liệu đã được lấy thành công, gửi nó xuống trang profile
        res.render('security', { user: results[0], thongbao })
    })

});

app.get('/profile', (req, res) => {
    const user = req.session.user
    db.query('SELECT * FROM account WHERE Email = ?', [user.Email], (error, results) => {
        if (error) {
            throw error
        }
        res.render('profile', { user: results[0] })
    })
})
app.get('/logout', (req, res) => {

    req.session.destroy()
    res.redirect('/account/login')
})

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/')
    }

    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const email = req.flash('email') || ''



    res.render('login', { error, password, email })
})
app.get('/register', (req, res) => {
    const error = req.flash('error') || ''
    const name = req.flash('name') || ''
    const email = req.flash('email') || ''
    const phone = req.flash('phone') || ''

    res.render('register', { error, name, email, phone })
})

app.get('/confirm', (req, res) => {
    const error = req.flash('error') || ''
    const otp = req.flash('otp') || ''
    const phone = req.flash('phone') || ''
    res.render('confirm', { otp, phone, error })
})
app.get('/verify_2', (req, res) => {
    const error = req.flash('error') || ''
    const otp = req.flash('otp') || ''
    res.render('verify_2', { otp, error })
})
app.get('/forgot', (req, res) => {
    const error = req.flash('error') || ''
    const otp = req.flash('otp') || ''
    const phone = req.flash('phone') || ''
    res.render('confirm', { otp, phone, error })
})
app.get('/change_pass', (req, res) => {
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''

    res.render('change_pass', { error, password })
})

const changePassValidator2 = [
    check('pass_old').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống mật khẩu ')
    .isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),

    check('pass_new1').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống mật khẩu ')
    .isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),

    check('pass_new2').exists().withMessage('Vui lòng nhập lại mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .custom((value, { req }) => {
        if (value !== req.body.pass_new1) {
            throw new Error('Mật khẩu không khớp')
        }
        return true;

    }),
]
const cofirmValidator = [
    check('otp').exists().withMessage('Vui lòng nhập mã OTP')
    .notEmpty().withMessage('Không được để trống mã OTP')
]

const loginValidator = [
    check('email').exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Email không hợp lệ'),

    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống mật khẩu ')
    .isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),
]
const changePassValidator = [
    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống mật khẩu ')
    .isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),

    check('confirmPassword').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Mật khẩu không khớp')
        }
        return true;

    }),

]

const registerValidator = [
    check('name').exists().withMessage('Vui long nhap ten nguoi dung')
    .notEmpty().withMessage('Khong duoc de trong ten nguoi dung')
    .isLength({ min: 6 }).withMessage("Ten nguoi dung phai tu 6 ky tu "),

    check('email').exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Email không hợp lệ'),

    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống mật khẩu ')
    .isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),

    check('confirmPassword').exists().withMessage('Vui long nhap xac nhan mat khau')
    .notEmpty().withMessage('Vui long nhap xac nhan mat khau')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Mat khau khong khop')
        }
        return true;

    }),

    check('phone').exists().withMessage('Vui lòng nhập số điện thoại')
    .notEmpty().withMessage("Không được để trống số điện thoại")
]
app.get('/uploads/chuyen_doi_ta.jfif', function(req, res) {
    const imagePath = path.join(__dirname, 'uploads', 'chuyen_doi_ta.jfif');
    res.sendFile(imagePath);
});
app.get('/profile', (req, res) => {

    const user = req.session.user
    console.log(user)
        // Thực hiện truy vấn SQL để lấy thông tin người dùng
    db.query('SELECT * FROM account WHERE Email = ?', [user.Email], (error, results) => {
        if (error) {
            throw error
        }

        // Khi dữ liệu đã được lấy thành công, gửi nó xuống trang profile
        res.render('profile', { user })
    })
})
app.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req)

    if (result.errors.length === 0) {
        const { name, email, password, phone } = req.body
        const hashed = bcrypt.hashSync(password, 10)

        const sql = 'INSERT INTO account(Name,Email,Password,PhoneNumber,activated) values(?,?,?,?,0)'
        const params = [name, email, hashed, phone]


        db.query(sql, params, (err, result, fields) => {
            if (err) {
                req.flash('error', err.message)
                req.flash('name', name)
                req.flash('email', email)
                req.flash('phone', phone)
                return res.redirect("/account/register")
            } else if (result.affectedRows === 1) {
                req.flash('phone', phone)
                return res.redirect('/account/confirm')
            }
            req.flash('error', 'Đăng ký thất bại')
            req.flash('name', name)
            req.flash('email', email)
            req.flash('phone', phone)
            return res.redirect("/account/register")

        })



    } else {
        result = result.mapped()


        let message;
        for (fields in result) {
            message = result[fields].msg
            break;

        }
        const { name, email, password, phone } = req.body
        req.flash('error', message)
        req.flash('name', name)
        req.flash('email', email)
        req.flash('phone', phone)
        res.redirect("/account/register")

    }

})



app.post('/confirm', cofirmValidator, (req, res) => {
    let result = validationResult(req)
    const { otp, phone } = req.body

    if (result.errors.length === 0) {

        if (otp != OTP) {
            req.flash('error', 'Mã OTP không hợp lệ')
            return res.redirect("/account/confirm")
        }
        if (otp == OTP) {
            const sql = "UPDATE account SET activated = 1 WHERE PhoneNumber = ?" // ví dụ truy vấn SQL
            db.query(sql, [phone], (err, result) => {
                if (err) throw err
                console.log("Activated user:", phone)

                // Thông báo kích hoạt thành công
                req.flash('success', 'Tài khoản đã được kích hoạt.')

            })
            return res.redirect("/account/login")

        }
    }
})

const vonage = new Vonage({
    apiKey: "b98ca4f2",
    apiSecret: "RfLhjDHVJQQ2eUn7"
})


app.post('/send-verification-code', async(req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const from = "Vonage APIs"
    const to = `+84${phoneNumber}`;
    const text = `Mã xác nhận của bạn là ${OTP}`;

    async function sendSMS() {
        await vonage.sms.send({ to, from, text })
            .then(resp => {
                console.log('Message sent successfully');
                console.log(`Sending verification code ${OTP} to phone number ${phoneNumber}`);
            })
            .catch(err => {
                console.log('There was an error sending the messages.');
                console.error(err);
            });
    }

    sendSMS();

});

app.post('/forgot', cofirmValidator, (req, res) => {
    let result = validationResult(req)
    const { otp, phone } = req.body

    if (result.errors.length === 0) {

        if (otp != OTP) {
            req.flash('error', 'Mã OTP không hợp lệ')
            return res.redirect("/account/forgot")
        }
        if (otp == OTP) {

            res.redirect(`/account/change_pass?phone=${req.body.phone}`);


        }
    }
})


app.post('/change_pass', changePassValidator, (req, res) => {
    let result = validationResult(req)

    if (result.errors.length === 0) {
        const { password } = req.body
        const phone = req.query.phone // lấy giá trị phone từ query parameters
        const hashed = bcrypt.hashSync(password, 10)
        db.query("UPDATE account SET Password = ? WHERE PhoneNumber = ?", [hashed, phone], (error, results, fields) => {
            if (error) throw error;
            res.redirect('/account/login')
        });

    } else {
        result = result.mapped()
        let message;
        for (fields in result) {
            message = result[fields].msg
            break;

        }
        const { password } = req.body
        req.flash('error', message)
        req.flash('password', password)
        res.redirect("/account/change_pass")
    }
})

app.post('/verify_2', cofirmValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {
        const { otp } = req.body
        const email = req.query.email
        const params = [email]
        db.query('SELECT * FROM account WHERE  email =? ', params, (err, results, fields) => {
            if (err) {
                req.flash('error', err.message)
                req.flash('email', email)
                res.redirect("/account/verify_2")
            } else {

                if (otp == OTP) {
                    console.log('success', 'Xác thực thành công')
                    return res.redirect('/');
                } else {
                    req.flash('error', 'Mã OTP không chính xác')
                    return res.redirect('/account/verify_2');
                }
            }
        })
    }
})



app.post('/security', changePassValidator2, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {
        const user = req.session.user
        const { pass_old, pass_new1, pass_new2 } = req.body

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        const selectQuery = 'SELECT * FROM account WHERE Email = ?';
        db.query(selectQuery, [user.Email], (error, results, fields) => {
            if (error) throw error;

            if (results.length > 0) {
                const hashedPassword = results[0].Password;

                // Kiểm tra mật khẩu cũ
                bcrypt.compare(pass_old, hashedPassword, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        // Mật khẩu cũ khớp, tiếp tục đổi mật khẩu mới
                        if (pass_new1 === pass_new2) {
                            // Mã hóa mật khẩu mới
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(pass_new1, salt, (err, hash) => {
                                    if (err) throw err;

                                    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
                                    const updateQuery = 'UPDATE account SET Password = ? WHERE Email = ?';
                                    db.query(updateQuery, [hash, user.Email], (error, results, fields) => {
                                        if (error) throw error;

                                        console.log('Mật khẩu đã được cập nhật thành công');
                                        res.redirect('/account/security');
                                    });
                                });
                            });
                        } else {
                            console.log('Mật khẩu mới không khớp');
                            res.redirect('/account/security');
                        }
                    } else {
                        console.log('Mật khẩu cũ không đúng');
                        res.redirect('/account/security');
                    }
                });
            } else {
                console.log('Người dùng không tồn tại');
                res.redirect('/account/security');
            }
        });
    } else {
        console.log('Vui lòng nhập mật khẩu mới');
        res.redirect('/account/security');
    }
});
app.post('/login', loginValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {
        const { email, password } = req.body

        const params = [email]
        db.query('SELECT * FROM account WHERE email = ?', params, (err, results, fields) => {
            if (err) {
                req.flash('error', err.message)
                req.flash('password', password)
                req.flash('email', email)
                res.redirect("/account/login")
            } else if (results.length === 0) {
                req.flash('error', 'Email không tồn tại')
                req.flash('password', password)
                req.flash('email', email)
                return res.redirect("/account/login")
            } else {
                const hashed = results[0].Password
                const match = bcrypt.compareSync(password, hashed)
                const activated = results[0].activated // lấy giá trị của trường Activated
                if (activated === 0) {
                    req.flash('error', 'Tài khoản chưa được kích hoạt')
                    req.flash('password', password)
                    req.flash('email', email)
                    return res.redirect("/account/login")
                }

                if (!match) {
                    req.flash('error', 'Mật khẩu không chính xác')
                    req.flash('password', password)
                    req.flash('email', email)
                    return res.redirect("/account/login")
                } else {
                    // Kiểm tra quyền admin của người dùng
                    const isAdmin = results[0].role === 'admin';
                    delete results[0].Password
                    req.session.user = results[0]
                    const phone = results[0].PhoneNumber;
                    if (phone > 0) {
                        const from = "Vonage APIs"
                        const to = `+84${phone}`;
                        const text = `Mã xác nhận của bạn là ${OTP}`;

                        async function sendSMS() {
                            await vonage.sms.send({ to, from, text })
                                .then(resp => {
                                    console.log('Message sent successfully');
                                    console.log(`Sending verification code ${OTP} to phone number ${phone}`);
                                })
                                .catch(err => {
                                    console.log('There was an error sending the messages.');
                                    console.error(err);
                                });
                        }

                        sendSMS();
                        console.log(`Sending verification code ${OTP} to phone number ${phone}`);
                    }


                    if (isAdmin) {
                        return res.redirect('/');
                    } else {
                        return res.redirect(`/account/verify_2?email=${req.body.email}`);
                    }
                }
            }
        })
    } else {
        result = result.mapped()
        let message;
        for (fields in result) {
            message = result[fields].msg
            break;
        }
        const { email, password } = req.body
        req.flash('error', message)
        req.flash('password', password)
        req.flash('email', email)
        res.redirect("/account/login")
    }
})


app.post('/profile', (req, res) => {
    const name = req.body['first-name'];
    const phoneNumber = req.body['phone'];
    const user = req.session.user


    db.query(`UPDATE account SET Name = '${name}', PhoneNumber = '${phoneNumber}' WHERE Email = '${user.Email}'`, (error, results) => {
        if (error) throw error;
        console.log(`Updated ${results.changedRows} rows`);
        res.redirect('/profile')
    });
});

app.post('/upload-avatar', uploadAvatar.single('avatar'), function(req, res) {
    // Lấy tên tệp hình ảnh
    const avatarName = req.file.filename;
    const user = req.session.user

    // Lưu tên tệp hình ảnh vào cơ sở dữ liệu
    const sql = `UPDATE account SET avatar = '${avatarName}' WHERE id = ${user.id}`;
    db.query(sql, function(err, result) {
        if (err) throw err;
        console.log('Avatar updated');
        res.send('File uploaded successfully');
    });
});

// Define the "save-profile" function with file upload support



module.exports = app