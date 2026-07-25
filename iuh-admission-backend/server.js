require('dotenv').config(); // Đọc thông số từ file .env
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Cấu hình kết nối MySQL Aiven Cloud (dùng biến môi trường .env)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Bắt buộc khi kết nối với Aiven Cloud
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối CSDL
db.getConnection()
    .then(conn => {
        console.log('✅ Kết nối CSDL Aiven Cloud (iuh_admission_db) thành công!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối MySQL Aiven Cloud:', err.message);
    });

// API 1: Lấy danh sách ngành theo Mã Tổ Hợp
app.get('/api/majors', async (req, res) => {
    const { combination } = req.query;
    try {
        if (!combination) return res.status(400).json({ error: 'Thiếu mã tổ hợp môn!' });

        const [combRows] = await db.query('SELECT id FROM subject_combinations WHERE code = ?', [combination]);
        if (combRows.length === 0) return res.json([]);
        
        const combId = combRows[0].id;
        const [majors] = await db.query(
            "SELECT id, code, name FROM majors WHERE FIND_IN_SET(?, accepted_combination_ids)", 
            [combId]
        );

        res.json(majors);
    } catch (err) {
        console.error("Lỗi API /api/majors:", err);
        res.status(500).json({ error: 'Lỗi Server khi lấy danh sách ngành!' });
    }
});

// API 2: Lấy điểm chuẩn của ngành theo major_id
app.get('/api/benchmark', async (req, res) => {
    const { major_id, year } = req.query;
    try {
        if (!major_id) return res.status(400).json({ error: 'Thiếu ID ngành!' });

        const [rows] = await db.query(
            `SELECT m.id, m.code, m.name, mb.benchmark_score, mb.year 
             FROM major_benchmarks mb 
             JOIN majors m ON mb.major_id = m.id 
             WHERE mb.major_id = ? AND mb.year = ?`,
            [major_id, year || 2025]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy điểm chuẩn!' });

        res.json(rows[0]);
    } catch (err) {
        console.error("Lỗi API /api/benchmark:", err);
        res.status(500).json({ error: 'Lỗi Server khi lấy điểm chuẩn!' });
    }
});

// API 3: Lưu lịch sử tính điểm
app.post('/api/save-history', async (req, res) => {
    const { major_id, final_score, status } = req.body;
    try {
        await db.query(
            "INSERT INTO calculation_history (major_id, final_score, status) VALUES (?, ?, ?)",
            [major_id, final_score, status]
        );
        res.json({ success: true, message: 'Đã lưu lịch sử tính điểm!' });
    } catch (err) {
        console.error("Lỗi API /api/save-history:", err);
        res.status(500).json({ error: 'Không thể lưu lịch sử!' });
    }
});

// API 4: Lấy 10 lượt tính điểm gần nhất
app.get('/api/history', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.id, m.name AS major_name, h.final_score, h.status 
            FROM calculation_history h
            JOIN majors m ON h.major_id = m.id
            ORDER BY h.id DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi API /api/history:", err);
        res.status(500).json({ error: 'Lỗi Server khi lấy lịch sử tính điểm!' });
    }
});

// Trang chủ kiểm tra Server
app.get('/', (req, res) => {
    res.send('🚀 Server Backend IUH Admission đang hoạt động ngon lành trên Cloud!');
});

// Khởi chạy Server (LUÔN LUÔN ĐẶT Ở CUỐI CÙNG FILE)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại port: ${PORT}`);
});

// API 5: Xóa toàn bộ lịch sử tính điểm
app.delete('/api/history', async (req, res) => {
    try {
        await db.query('DELETE FROM calculation_history');
        res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử!' });
    } catch (err) {
        console.error("Lỗi API DELETE /api/history:", err);
        res.status(500).json({ error: 'Không thể xóa lịch sử!' });
    }
});