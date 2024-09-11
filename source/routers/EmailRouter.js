const express = require('express');
const app = express.Router();
const db = require('../db');
app.use(express.urlencoded())

app.get('/error', (req, res) => {
    res.render('error');
});
app.get('/no_email', (req, res) => {
    const user = req.session.user
    db.query('SELECT * FROM email WHERE `to` = ?', [user.Email], (error, results) => {
        if (error) {
            throw error
        }
        res.render('no_email', { user })
    })
})


app.get('/get-email/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM Email WHERE `id` = ?', [id], (err, emails) => {
        if (err) throw err;
        let email = emails[0];
        res.json(email);
    })
})
app.get('/draft', (req, res) => {
    const user = req.session.user

    db.query('SELECT * FROM draft', (err, emails) => {
        if (err) throw err;

        res.render('draft', { user, emails })
    })
})

app.get('/draft-emails', (req, res) => {
    db.query('SELECT * FROM draft', (err, emails) => {
        if (err) throw err;

        res.json(emails);
    })
})

app.get('/draft/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM draft WHERE `id` = ?', [id], (err, result) => {
        if (err) throw err;

        res.json(result);
    })
})
app.get('/search', function(req, res) {
    const user = req.session.user;
    const keyword = req.query.keyword;
    const from = req.query.from;
    const to = req.query.to;
    const subject = req.query.subject;

    let sql = 'SELECT * FROM email';

    if (keyword) {
        const query = `
        SELECT * FROM email WHERE subject LIKE ? OR content LIKE ? OR sender LIKE ?`;

        db.query(query, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`], (error, results) => {
            if (error) throw error;

            const emails = results;
            console.log(results);
            res.render('search', { keyword, emails, user });
        });
    } else {
        if (from) {
            if (sql.includes('WHERE')) {
                sql += ' AND `from` = ?';
            } else {
                sql += ' WHERE `from` = ?';
            }
        }

        if (to) {
            if (sql.includes('WHERE')) {
                sql += ' AND `to` = ?';
            } else {
                sql += ' WHERE `to` = ?';
            }
        }

        if (subject) {
            if (sql.includes('WHERE')) {
                sql += ' AND subject = ?';
            } else {
                sql += ' WHERE subject = ?';
            }
        }

        const params = [];

        if (from) {
            params.push(from);
        }

        if (to) {
            params.push(to);
        }

        if (subject) {
            params.push(subject);
        }

        db.query(sql, params, function(error, results, fields) {
            if (error) {
                console.error(error);
                res.redirect('/error');
            } else {
                const emails = results;

                return res.render('search', { user, emails });
            }
        });
    }
});

app.get('/sent', (req, res) => {
    const user = req.session.user
    db.query('SELECT * FROM Email WHERE `from` = ?', [user.Email], (err, emails) => {
        if (err) throw err;

        res.render('sent', { user, emails })
    })
})

app.get('/starred', (req, res) => {
    const user = req.session.user

    db.query('SELECT * FROM Email WHERE `starred` = ?', true, (err, emails) => {
        if (err) throw err;

        res.render('starred', { user, emails })
    })
})


app.get('/snoozed', (req, res) => res.send('Snoozed'))



app.delete('/:id', (req, res) => {
    const { id } = req.params
    db.query('DELETE FROM Email WHERE id = ?', [id], (err, res) => {
        if (err) throw err
        console.log('Deleted email with id', id)
    })

})

app.put('/starred/:id', (req, res) => {
    const { id } = req.params;
    const { starred } = req.body;
    db.query(`UPDATE Email SET starred = ${starred} WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        return res.status(200).send('Email has been starred');
    });
});

app.put('/isRead/:id', (req, res) => {
    const { id } = req.params;
    const { isRead } = req.body;
    db.query(`UPDATE Email SET isRead = ${isRead} WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        return res.status(200).send('Email has been starred');
    });
});

app.get('/meta/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Email WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length === 0) {
            return res.status(404).send('Email not found');
        }

        const email = result[0];
        return res.json(email);
    });
});


//labels
app.get('/labels', (req, res) => {
    const user = req.session.user
    const userId = user.id

    db.query('SELECT * FROM labels WHERE user_id = ?', userId, (error, results) => {
        if (error) {
            throw error;
        }

        res.json(results);
    });
});


app.post('/labels', (req, res) => {
    const name = req.body.name;
    const user = req.session.user
    const userId = user.id

    db.query('INSERT INTO labels (name, user_id) VALUES (?, ?)', [name, userId], (error, results) => {
        if (error) {
            throw error;
        }

        res.json({ id: results.insertId });
    });
});


app.get('/get_labels', function(req, res) {
    const user = req.session.user
    const userId = user.id

    db.query('SELECT name FROM labels WHERE user_id = ?', userId, (error, results) => {
        if (error) {
            throw error;
        }

        res.json(results);
    });
});

app.delete('/labels/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM labels WHERE id = ?', id, (error, results) => {
        if (error) {
            throw error;
        }

        res.json({ message: 'Label deleted successfully.' });
    });
});

app.put('/labels/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const query = 'UPDATE labels SET name = ? WHERE id = ?';
    db.query(query, [name, id], (err, result) => {
        if (err) throw err;
        const updatedLabel = { id: id, name: name };
        res.json(updatedLabel);
    });
});




app.post('/emails/:id/labels', function(req, res) {
    let emailId = req.params.id;
    let labelId = req.body.labelId;

    // Lấy email và cập nhật các nhãn của nó
    let sql = 'SELECT * FROM emails WHERE id = ?';
    db.query(sql, [emailId], function(err, result) {
        if (err) throw err;

        let email = result[0];
        let labels = email.labels ? JSON.parse(email.labels) : [];
        labels.push(labelId);
        labels = Array.from(new Set(labels)); // Loại bỏ các nhãn trùng lặp
        labels = JSON.stringify(labels);

        // Cập nhật các nhãn của email vào cơ sở dữ liệu
        let sql = 'UPDATE emails SET labels = ? WHERE id = ?';
        db.query(sql, [labels, emailId], function(err, result) {
            if (err) throw err;

            res.send('OK');
        });
    });
});

app.post('/add_mail_to_label', function(req, res) {
    let mailId = req.body.mailId;
    res.send(mailId);
    let labelName = req.body.labelName;

    // Tìm ID của nhãn tương ứng
    db.query('SELECT id FROM labels WHERE name = ?', labelName, function(error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send('Lỗi khi tìm kiếm nhãn!');
            return;
        }

        if (results.length === 0) {
            console.log('Không tìm thấy nhãn:', labelName);
            res.status(404).send('Không tìm thấy nhãn!');
            return;
        }

        let labelId = results[0].id;

        // Đổi label_id của email thành labelId
        db.query('UPDATE email SET label_id = ? WHERE id = ?', [labelId, mailId], function(error, results, fields) {
            if (error) {
                console.log(error);
                res.status(500).send('Lỗi khi lưu mail vào nhãn!');
                return;
            }

            console.log('Đã lưu mail vào nhãn thành công!');
        });
    });
});

app.get('/emails/:id', function(req, res) {
    const labelId = req.params.id;
    const user = req.session.user;

    db.query('SELECT * FROM email WHERE label_id = ? AND `to` = ? ', [labelId, user.Email], function(error, results, fields) {
        if (error) {
            console.log(error);
            return res.redirect('/no_email');
        }

        if (results.length === 0) {
            return res.redirect('/no_email');
        }

        const emails = results;
        res.render('emails', { user, emails })
    });
});



app.get('/reply/:subjectData', (req, res) => {
    const user = req.session.user;
    const { subjectData } = req.params;

    db.query(`SELECT * FROM Email WHERE Subject LIKE '%RE:${subjectData}%'`, (err, result) => {
        if (err) throw err;

        const reply = result;
        res.json({ reply });
    })
})

app.post('/draft', (req, res) => {
    let { to, from, bcc, cc, subject, content, sendAt } = req.body;
    db.query('INSERT INTO draft (sender, receiver, bcc, cc, subject, content, sendAt) VALUES (?, ?, ?, ?, ?, ?, ?)', [from, to, bcc, cc, subject, content, sendAt], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: err });
        }
        return res.status(200).json({ message: "Success" });
    })
})

app.get('/email-detail/:id', async(req, res) => {
    const { id } = req.params;
    const user = req.session.user;

    if (!user) {
        return res.redirect('/account/login')
    }

    db.query('SELECT * FROM Email WHERE id = ?', [id], (err, result) => {
        const email = result[0];
        const bccEmails = email.bcc ? email.bcc.split(';').map(email => email.trim()) : [];
        const filteredBccEmails = bccEmails.filter(email => email === user.Email);
        res.render('./email-detail', { email, user, filteredBccEmails, getTimeDiff })
    })
});


function getTimeDiff(timestamp) {
    const now = new Date().getTime();
    const timeDiff = new Date(timestamp).getTime();
    const diff = now - timeDiff;

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
        return seconds + " seconds ago";
    }

    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) {
        return minutes + " minutes ago";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
        return hours + " hours ago";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days + " days ago";
}


//trash

app.get('/trash/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM trash WHERE `id` = ?', [id], (err, result) => {
        if (err) throw err;

        let email = result[0]
        res.json(email);
    })
})
app.get('/trash', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.redirect('/account/login')
    }
    db.query('SELECT * FROM trash', (err, emails) => {
        if (err) throw err;

        res.render('trash', { user, emails })
    })
})

app.post('/trash', (req, res) => {
    let { sender, receiver, bcc, cc, subject, content, sendAt } = req.body;
    db.query('INSERT INTO trash (sender, receiver, bcc, cc, subject, content, sendAt) VALUES (?, ?, ?, ?, ?, ?, ?)', [sender, receiver, bcc, cc, subject, content, sendAt], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: err });
        }
        return res.status(200).json({ message: "Success" });
    })
})

app.delete('/trash/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM trash WHERE `id` = ?', [id], (err, email) => {
        if (err) throw err;

        console.log('Deleted')
    })
})


//block-user

app.post('/api/check-blocked-users', (req, res) => {
    const { userA, userB } = req.body;
    const sql = 'SELECT * FROM blocked_users WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)';
    db.query(sql, [userA, userB, userB, userA], (err, results) => {
        if (err) {
            console.error('Error checking blocked users', err);
            res.sendStatus(500);
            return;
        }
        if (results.length > 0) {
            res.json({ status: 'both_blocked' });
        } else {
            res.json({ status: 'not_blocked' });
        }
    });
});

// Thêm hoặc cập nhật thông tin người dùng vào bảng 'blocked_users'
app.post('/api/block-user', (req, res) => {
    const { userA, userB } = req.body;
    const sql = 'SELECT * FROM blocked_users WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)';
    db.query(sql, [userA, userB, userB, userA], (err, results) => {
        if (err) {
            console.error('Error checking blocked users', err);
            res.sendStatus(500);
            return;
        }
        if (results.length > 0) {
            res.json({ status: 'already_blocked' });
        } else {
            const sql = 'INSERT INTO blocked_users (user_a, user_b) VALUES (?, ?)';
            db.query(sql, [userA, userB], (err, results) => {
                if (err) {
                    console.error('Error blocking user', err);
                    res.sendStatus(500);
                    return;
                }
                res.json({ status: 'blocked' });
            });
        }
    });
});


app.post('/api/delete-emails', (req, res) => {
    const userA = req.body.userA;
    const userB = req.body.userB;

    const query = 'DELETE FROM email WHERE (`from` = ? AND `to` = ?) OR ( `to` = ? AND `from` = ?)';

    db.query(query, [userB, userA, userA, userB], (error, result) => {
        if (error) {
            console.error('Error deleting emails:', error);
            res.status(500).json({ message: 'An error occurred while deleting emails' });
        } else {
            console.log(`${result.affectedRows} emails deleted`);
            res.status(200).json({ message: 'Emails deleted successfully' });
        }
    });
});


app.get('/api/check-blocked', (req, res) => {
    const { sender, recipient } = req.query;

    const query = `
      SELECT COUNT(*) AS count FROM blocked_users
      WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)
    `;
    db.query(query, [sender, recipient, recipient, sender], (error, results) => {
        if (error) {
            throw error;
        } else {
            console.log(results);
            const count = results[0].count;
            const isBlocked = count > 0;
            res.json({ isBlocked });
        }
    });
});

app.get('/dashboard', (req, res) => {
    const user = req.session.user;

    // Đếm số lượng người dùng đã đăng ký
    db.query('SELECT COUNT(*) AS user_count FROM account', (error, results, fields) => {
        if (error) throw error;
        const userCount = results[0].user_count;

        // Đếm số lượng email đã được gửi và nhận
        db.query('SELECT COUNT(*) AS email_count FROM email', (error, results, fields) => {
            if (error) throw error;
            const emailCount = results[0].email_count;

            // Tổng dung lượng hộp thư email sử dụng
            db.query('SELECT  COUNT(*) AS total_storage FROM account WHERE activated = 1', (error, results, fields) => {
                if (error) throw error;
                const totalStorage = results[0].total_storage;

                // Số lượng email đã được đánh dấu sao hoặc chưa đọc
                db.query('SELECT COUNT(*) AS unread_count FROM email WHERE isRead = 0 ', (error, results, fields) => {
                    if (error) throw error;
                    const unreadCount = results[0].unread_count;

                    // Số lượng email xóa bỏ và các email trong thùng rác
                    db.query('SELECT COUNT(*) AS trash_count FROM trash', (error, results, fields) => {
                        if (error) throw error;
                        const trashCount = results[0].trash_count;

                        // Số lượng labels đang được sử dụng.
                        db.query('SELECT COUNT(*) AS label_count FROM labels', (error, results, fields) => {
                            if (error) throw error;
                            const labelCount = results[0].label_count;

                            // Danh sách các tài khoản đang bị chặn (nếu có)
                            db.query('SELECT COUNT(*) AS blocked_users FROM blocked_users', (error, results, fields) => {
                                if (error) throw error;
                                const blockedUsers = results[0].blocked_users;

                                // Danh sách các email đã lưu nháp
                                db.query('SELECT COUNT(*) AS draft_count FROM draft', (error, results, fields) => {
                                    if (error) throw error;
                                    const draftCount = results[0].draft_count;


                                    res.render('dashboard', { user, userCount, emailCount, totalStorage, unreadCount, trashCount, labelCount, blockedUsers, draftCount });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = app;