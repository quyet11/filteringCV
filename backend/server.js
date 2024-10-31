require('dotenv').config(); // Để sử dụng biến môi trường từ file .env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');



// Tạo ứng dụng Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Cấu hình MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Kết nối tới MySQL
db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối đến MySQL');
});

// Tạo transporter cho Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Hàm để gửi email xác thực
const sendVerificationEmail = (fullname, email) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Email Xác Thực',
        text: `Xin chào ${fullname}, Chúc mừng bạn đã đăng ký thành công =${email}`
    };

    return transporter.sendMail(mailOptions);
};
// Đăng nhập người dùng

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng nhập thất bại' });
        }

        // Nếu không tìm thấy người dùng
        if (results.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = results[0];
        if (password !== user.password) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        // Đăng nhập thành công
        return res.status(200).json({ message: 'Đăng nhập thành công', user: { user_type: user.user_type } });
    });
});

// API đăng ký người dùng
app.post('/register', (req, res) => {
    const { fullname, email, password, user_type } = req.body;

    // Kiểm tra định dạng email
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Vui lòng sử dụng địa chỉ Gmail hợp lệ' });
    }

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng ký thất bại' });
        }

        console.log('Kết quả kiểm tra email:', results); // In ra kết quả kiểm tra email

        // Kiểm tra nếu email đã tồn tại
        if (results.length > 0) {
            console.log('Email đã tồn tại:', email);
            return res.status(400).json({ message: 'Email đã tồn tại. Vui lòng sử dụng email khác.' });
        }

        // Nếu email chưa tồn tại, lưu thông tin người dùng vào MySQL
        const sql = 'INSERT INTO users (fullname, email, password, user_type) VALUES (?, ?, ?, ?)';
        db.query(sql, [fullname, email, password, user_type], (err, result) => {
            if (err) {
                console.error('Lỗi khi lưu dữ liệu:', err);
                return res.status(500).json({ message: 'Đăng ký thất bại' });
            }

            // Gửi email xác thực
            sendVerificationEmail(fullname, email)
                .then(() => {
                    return res.status(200).json({ message: 'Đăng ký thành công, kiểm tra email để xác thực!' });
                })
                .catch((error) => {
                    console.error('Lỗi khi gửi email:', error);
                    return res.status(500).json({ message: 'Không thể gửi email xác thực' });
                });
        });
    });
});app.post('/register', (req, res) => {
    const { fullname, email, password, user_type } = req.body;

    // Kiểm tra định dạng email
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Vui lòng sử dụng địa chỉ Gmail hợp lệ' });
    }

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng ký thất bại' });
        }

        console.log('Kết quả kiểm tra email:', results); // In ra kết quả kiểm tra email

        // Kiểm tra nếu email đã tồn tại
        if (results.length > 0) {
            console.log('Email đã tồn tại:', email);
            return res.status(400).json({ message: 'Email đã tồn tại. Vui lòng sử dụng email khác.' });
        }

        // Nếu email chưa tồn tại, lưu thông tin người dùng vào MySQL
        const sql = 'INSERT INTO users (fullname, email, password, user_type) VALUES (?, ?, ?, ?)';
        db.query(sql, [fullname, email, password, user_type], (err, result) => {
            if (err) {
                console.error('Lỗi khi lưu dữ liệu:', err);
                return res.status(500).json({ message: 'Đăng ký thất bại' });
            }

            // Gửi email xác thực
            sendVerificationEmail(fullname, email)
                .then(() => {
                    return res.status(200).json({ message: 'Đăng ký thành công, kiểm tra email để xác thực!' });
                })
                .catch((error) => {
                    console.error('Lỗi khi gửi email:', error);
                    return res.status(500).json({ message: 'Không thể gửi email xác thực' });
                });
        });
    });
});


// API để thêm job posting
// API để thêm job posting
app.post('/job-postings', (req, res) => {
    // Kiểm tra dữ liệu từ request body
    const { jobTitle, jobDescription, requiredSkills, experience, salaryRange, expiryDate, jobType, postedDate } = req.body;

    if (!jobTitle || !jobDescription || !requiredSkills || !experience || !salaryRange || !expiryDate || !jobType || !postedDate) {
        return res.status(400).json({ message: 'Thiếu dữ liệu cần thiết cho job posting' });
    }

    const sql = `INSERT INTO job_postings (job_title, job_description, required_skills, experience, salary_range, expiry_date, job_type, posted_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; // Thêm posted_date vào cột

    // Chèn dữ liệu vào CSDL
    db.query(sql, [jobTitle, jobDescription, requiredSkills, experience, salaryRange, expiryDate, jobType, postedDate], (err, result) => {
        if (err) {
            console.error('Lỗi khi lưu job posting:', err);
            return res.status(500).json({ message: 'Lưu job posting thất bại' });
        }
        return res.status(201).json({ message: 'Lưu job posting thành công' });
    });
});



app.get('/job-postings', (req, res) => {
    const sql = 'SELECT * FROM job_postings ORDER BY posted_date DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách job postings:', err);
            return res.status(500).json({ message: 'Lấy danh sách thất bại' });
        }

        // Trả về danh sách job postings
        return res.status(200).json(results);
    });
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Đường dẫn đến thư mục bạn muốn lưu tệp
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Đặt tên cho tệp
    },
});

const upload = multer({ storage: storage }); // Chỉ nên định nghĩa một lần


// Route để nhận thông tin ứng tuyển
app.post('/api/apply', upload.single('cv'), (req, res) => {
    console.log('Request body:', req.body);
    console.log('User ID:', req.body.userId); // Hoặc `req.user.id` nếu dùng session

    const { fullName, email, coverLetter, jobId, userId } = req.body;
    const cvPath = req.file ? req.file.path : null;

    if (!fullName || !email || !coverLetter || !cvPath || !jobId || !userId) {
        return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }

    const sql = 'INSERT INTO applications (name, email, cover_letter, cv, job_id, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [fullName, email, coverLetter, cvPath, jobId, userId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Lỗi khi lưu đơn ứng tuyển' });
        }
        res.status(200).json({ message: 'Đơn ứng tuyển đã được gửi thành công' });
    });
});


// API để lưu hồ sơ ứng viên
app.post('/api/candidate-profile', upload.single('profilePicture'), (req, res) => {
    const { fullName, email, workExperience, education } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!fullName || !email || !profilePicture || !workExperience || !education) {
        return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }

    // Kiểm tra email đã tồn tại chưa
    const checkEmailSql = 'SELECT * FROM candidate_profiles WHERE email = ?';
    db.query(checkEmailSql, [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Lỗi kiểm tra email' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Nếu email chưa tồn tại, tiếp tục lưu dữ liệu
        const sql = 'INSERT INTO candidate_profiles (full_name, email, profile_picture, work_experience, education) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [fullName, email, profilePicture, workExperience, education], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Lỗi khi lưu thông tin ứng viên' });
            }
            res.status(200).json({ message: 'Lưu thông tin ứng viên thành công' });
        });
    });
});




// API để lấy danh sách ứng viên
app.get('/api/candidates', (req, res) => {
    const sql = 'SELECT * FROM candidate_profiles';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng viên:', err);
            return res.status(500).json({ message: 'Lấy danh sách ứng viên thất bại' });
        }

        return res.status(200).json(results);
    });
});
app.get('/api/applications/:jobId', (req, res) => {
    const { jobId } = req.params;
    const sql = 'SELECT * FROM applications WHERE job_id = ?';

    db.query(sql, [jobId], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng tuyển:', err);
            return res.status(500).json({ message: 'Lấy danh sách ứng tuyển thất bại' });
        }

        return res.status(200).json(results);
    });
});
app.get('/api/applicants', (req, res) => {
    const sql = 'SELECT * FROM applications';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng viên:', err);
            res.status(500).json({ message: 'Lỗi khi lấy danh sách ứng viên' });
        } else {
            res.json(results);
        }
    });
});
// In your Express server file
app.use(express.json());
app.post('/api/evaluate-cv', (req, res) => {
    const applicantData = req.body;

    console.log('Applicant Data:', applicantData); // Log dữ liệu nhận được

    const evaluationResult = {
        applicantName: applicantData.name,
        score: Math.random() * 100,
        feedback: "Good candidate for the job.",
    };

    // Kiểm tra định dạng JSON
    console.log('Evaluation Result:', evaluationResult);

    res.json(evaluationResult);
});
app.get('/api/applicants/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL
    const sql = 'SELECT * FROM applications WHERE id = ?'; // Truy vấn để lấy thông tin ứng viên theo ID

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin ứng viên:', err);
            return res.status(500).json({ message: 'Lấy thông tin ứng viên thất bại' });
        }

        // Kiểm tra xem có ứng viên nào với ID đã cho không
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ứng viên với ID đã cho.' });
        }

        // Trả về thông tin ứng viên
        return res.status(200).json(results[0]);
    });
});


// Chạy server trên cổng 3001
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
