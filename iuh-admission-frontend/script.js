// --- Hàm lọc và nạp danh sách Ngành dựa trên Tổ hợp được chọn ---
// --- Lấy danh sách Ngành từ Database qua API trên Render ---
async function capNhatDanhSachNganhTheoToHop(maToHop) {
    const selectNganh = document.getElementById('selectNganh');
    if (!selectNganh) return;

    if (!maToHop) {
        selectNganh.innerHTML = '<option value="" disabled selected>-- Vui lòng chọn tổ hợp môn trước --</option>';
        selectNganh.disabled = true;
        return;
    }

    selectNganh.innerHTML = '<option value="" disabled selected>-- Đang tải danh sách ngành... --</option>';

    try {
        const response = await fetch(`https://iuh-admission-api.onrender.com/api/majors?combination=${maToHop}`);
        const danhSachNganhHopLe = await response.json();

        selectNganh.innerHTML = '<option value="" disabled selected>-- Chọn ngành muốn xét tuyển --</option>';

        if (danhSachNganhHopLe.length > 0) {
            danhSachNganhHopLe.forEach(nganh => {
                const option = document.createElement('option');
                option.value = nganh.id; // Dùng ID ngành trong Database làm value
                option.innerText = `${nganh.code} - ${nganh.name}`;
                selectNganh.appendChild(option);
            });
            selectNganh.disabled = false;
        } else {
            selectNganh.innerHTML = '<option value="" disabled selected>-- Không có ngành nào xét tổ hợp này --</option>';
            selectNganh.disabled = true;
        }
    } catch (error) {
        console.error("Lỗi kết nối Server:", error);
        selectNganh.innerHTML = '<option value="" disabled selected>-- Lỗi kết nối CSDL! --</option>';
    }
}

// --- Sự kiện tự động thay đổi tên môn học khi chọn tổ hợp ---
function xuLyKhiDoiToHop() {
    const selectToHop = document.getElementById('danhMucToHop');
    if (!selectToHop) return;

    const maToHopDuocChon = selectToHop.value;
    const selectedOptionText = selectToHop.options[selectToHop.selectedIndex].text;

    // 1. Cập nhật tên môn học hiển thị trong bảng
    if (selectedOptionText && selectedOptionText.includes(':')) {
        const chuoiCacMon = selectedOptionText.split(':')[1].trim(); 
        const cacMon = chuoiCacMon.split(',').map(m => m.trim());    

        document.getElementById('lblMon1').innerText = cacMon[0] || "Môn 1";
        document.getElementById('lblMon2').innerText = cacMon[1] || "Môn 2";
        document.getElementById('lblMon3').innerText = cacMon[2] || "Môn 3";
    } else {
        document.getElementById('lblMon1').innerText = "Môn 1";
        document.getElementById('lblMon2').innerText = "Môn 2";
        document.getElementById('lblMon3').innerText = "Môn 3";
    }

    // 2. Kích hoạt lọc ngành tương ứng ngay lập tức
    capNhatDanhSachNganhTheoToHop(maToHopDuocChon);
}

// --- 🚀 HÀM MỚI THÊM: Tải và hiển thị danh sách Lịch sử tính điểm ---
async function taiLichSuTinhDiem() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    try {
        const res = await fetch('https://iuh-admission-api.onrender.com/api/history');
        const data = await res.json();

        if (!data || data.length === 0) {
            historyList.innerHTML = '<p class="text-muted" style="text-align: center; color: #888;">Chưa có lịch sử tính điểm nào.</p>';
            return;
        }

        let html = '';
        data.forEach(item => {
            let statusText = '';
            let badgeClass = '';

            if (item.status === 'SAFE') {
                statusText = '🟢 An toàn';
                badgeClass = 'badge-safe';
            } else if (item.status === 'CONSIDER') {
                statusText = '🟡 Cân nhắc';
                badgeClass = 'badge-consider';
            } else {
                statusText = '🔴 Rủi ro';
                badgeClass = 'badge-risk';
            }

            // Định dạng thời gian (Giờ:Phút Ngày/Tháng)
            let thoiGianStr = '';
            if (item.created_at) {
                const dateObj = new Date(item.created_at);
                thoiGianStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + dateObj.toLocaleDateString('vi-VN');
            }

            html += `
                <div class="history-item">
                    <div>
                        <b>${item.major_name}</b> <br>
                        <small style="color: #888;">${thoiGianStr}</small>
                    </div>
                    <div>
                        <span>Điểm: <b>${parseFloat(item.final_score).toFixed(2)}</b></span>
                        <span class="${badgeClass}" style="margin-left: 10px;">${statusText}</span>
                    </div>
                </div>
            `;
        });

        historyList.innerHTML = html;
    } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
        historyList.innerHTML = '<p class="text-muted" style="text-align: center; color: #888;">Không thể kết nối lịch sử tính điểm.</p>';
    }
}

// Lắng nghe sự kiện đổi tổ hợp và khởi chạy khi trang tải xong
const selectToHopElem = document.getElementById('danhMucToHop');
if (selectToHopElem) {
    selectToHopElem.addEventListener('change', xuLyKhiDoiToHop);
}

document.addEventListener('DOMContentLoaded', () => {
    xuLyKhiDoiToHop(); // Chạy đồng bộ khi load trang
    taiLichSuTinhDiem(); // Tải lịch sử ngay khi tải xong trang web
});


// --- Các hàm tính toán logic độc lập ---
function quyDoiDGNL(diemDgnlGoc, diemThuKhoaDgnl = 1139) {
    return (diemDgnlGoc * 30.0) / diemThuKhoaDgnl;
}

function diemKvDt(khuVuc, doiTuong) {
    let ut = 0.0;
    if (khuVuc === "KV1") ut += 0.75;
    else if (khuVuc === "KV2-NT") ut += 0.5;
    else if (khuVuc === "KV2") ut += 0.25;

    if (doiTuong === 1) ut += 2.0;
    else if (doiTuong === 2) ut += 1.0;

    return ut;
}

function congThuc1(diemK, diemHocBa, diemUt, diemCong) {
    return (diemK * 0.7) + (diemHocBa * 0.3) + diemUt + diemCong;
}

function congThuc2(diemThpt, diemUt, diemCong) {
    return diemThpt + diemUt + diemCong;
}

function congThuc3(diemDgnlQuyDoi, diemUt, diemCong) {
    return diemDgnlQuyDoi + diemUt + diemCong;
}


// --- Hàm Luồng chạy chính xử lý sự kiện khi nhấn nút bấm ---
async function xuLyTinhDiem() {
    let diemThuKhoaDgnl = 1139;

    let maToHop = document.getElementById('danhMucToHop').value;
    let maNganhDuocChon = document.getElementById('selectNganh').value;

    if (!maToHop) {
        alert("Vui lòng chọn tổ hợp môn trước khi tính điểm!");
        return;
    }
    if (!maNganhDuocChon) {
        alert("Vui lòng chọn ngành muốn xét tuyển!");
        return;
    }

    // 1. Đọc điểm THPT & Học bạ từ bảng (Giới hạn max 10/môn)
    let thpt1 = parseFloat(document.getElementById('thptMon1').value) || 0;
    let thpt2 = parseFloat(document.getElementById('thptMon2').value) || 0;
    let thpt3 = parseFloat(document.getElementById('thptMon3').value) || 0;
    let diemThpt = Math.min(thpt1, 10) + Math.min(thpt2, 10) + Math.min(thpt3, 10);

    let hb1 = parseFloat(document.getElementById('hbMon1').value) || 0;
    let hb2 = parseFloat(document.getElementById('hbMon2').value) || 0;
    let hb3 = parseFloat(document.getElementById('hbMon3').value) || 0;
    let diemHocBa = Math.min(hb1, 10) + Math.min(hb2, 10) + Math.min(hb3, 10);

    // 2. Đọc điểm ĐGNL, Ưu tiên & Thành tích
    let diemDgnlGoc = parseFloat(document.getElementById('diemDgnlGoc').value) || 0;

    // KIỂM TRA: Nếu nhập quá 1139 hoặc âm điểm thì báo lỗi bắt nhập lại
    if (diemDgnlGoc < 0 || diemDgnlGoc > 1139) {
        alert("Điểm Đánh giá năng lực không hợp lệ! Vui lòng nhập trong khoảng từ 0 đến 1139.");
        document.getElementById('diemDgnlGoc').focus();
        return;
    }

    let khuVuc = document.getElementById('khuVuc').value;
    let doiTuong = parseInt(document.getElementById('doiTuong').value);

    let diemThanhTich = parseFloat(document.getElementById('diemThanhTich').value) || 0;
    let diemIelts = parseFloat(document.getElementById('diemIelts').value) || 0;
    let diemCong = diemThanhTich + diemIelts;

    // Tính toán các thành phần trung gian
    let diemDgnlQuyDoi = 0.0;
    if (diemDgnlGoc > 0) {
        diemDgnlQuyDoi = quyDoiDGNL(diemDgnlGoc, diemThuKhoaDgnl);
    }

    let diemK = Math.max(diemThpt, diemDgnlQuyDoi);
    let diemUt = diemKvDt(khuVuc, doiTuong);

    // --- Giảm điểm ưu tiên theo Thông tư 08/2022/TT-BGDĐT ---
    let diemNenXetTuyen = Math.max(diemThpt, diemDgnlQuyDoi);
    if (diemNenXetTuyen >= 22.5) {
        diemUt = ((30.0 - diemNenXetTuyen) / 7.5) * diemUt;
    }

    // 3. Tính điểm các phương thức độc lập và ÉP TRẦN ĐIỂM <= 30
    let xt1 = 0.0, xt2 = 0.0, xt3 = 0.0;
    let htmlChiTiet = "";

    if ((diemThpt > 0 || diemDgnlGoc > 0) && diemHocBa > 0) {
        xt1 = congThuc1(diemK, diemHocBa, diemUt, diemCong);
        if (xt1 > 30.0) xt1 = 30.0;
        htmlChiTiet += `<div class="method-item">🔹 <b>Phương thức 1 (Kết hợp):</b> ${xt1.toFixed(2)} điểm</div>`;
    }

    if (diemThpt > 0) {
        xt2 = congThuc2(diemThpt, diemUt, diemCong);
        if (xt2 > 30.0) xt2 = 30.0;
        htmlChiTiet += `<div class="method-item">🔹 <b>Phương thức 2 (Thi THPT):</b> ${xt2.toFixed(2)} điểm</div>`;
    }

    if (diemDgnlGoc > 0) {
        xt3 = congThuc3(diemDgnlQuyDoi, diemUt, diemCong);
        if (xt3 > 30.0) xt3 = 30.0;
        htmlChiTiet += `<div class="method-item">🔹 <b>Phương thức 3 (Thi ĐGNL):</b> ${xt3.toFixed(2)} điểm</div>`;
    }

    // Xác định điểm lớn nhất
    let tongDiemMax = 0;
    if (xt2 >= xt1 && xt2 >= xt3) {
        tongDiemMax = xt2;
    } else if (xt3 >= xt1 && xt3 >= xt2) {
        tongDiemMax = xt3;
    } else {
        tongDiemMax = xt1;
    }

    // 4. TÌM ĐIỂM CHUẨN TỪ SERVER RENDER & LƯU LỊCH SỬ
    let htmlSoSanh = "";

    try {
        const res = await fetch(`https://iuh-admission-api.onrender.com/api/benchmark?major_id=${maNganhDuocChon}&year=2025`);
        const thongTinNganh = await res.json();

        if (thongTinNganh && thongTinNganh.benchmark_score) {
            let diemChuan2025 = parseFloat(thongTinNganh.benchmark_score);
            let chenhLech = tongDiemMax - diemChuan2025;

            let danhGiaClass = "";
            let danhGiaText = "";

            if (chenhLech >= 0.75) {
                danhGiaClass = "status-safe";
                danhGiaText = "🟢 AN TOÀN (Điểm xét tuyển cao hơn mức tham khảo 2025)";
            } else if (chenhLech >= -0.5) {
                danhGiaClass = "status-warning";
                danhGiaText = "🟡 CÂN NHẮC (Điểm xét tuyển khá sát mức tham khảo 2025)";
            } else {
                danhGiaClass = "status-danger";
                danhGiaText = "🔴 RỦI RO CAO (Điểm xét tuyển thấp hơn mức tham khảo 2025)";
            }

            htmlSoSanh = `
                <hr>
                <div class="analysis-box">
                    <p>Ngành đăng ký: <b>${thongTinNganh.name}</b></p>
                    <p>Điểm chuẩn năm 2025: <b>${diemChuan2025.toFixed(2)}</b> điểm</p>
                    <p>Mức chênh lệch: <b class="${chenhLech >= 0 ? 'text-plus' : 'text-minus'}">${chenhLech >= 0 ? '+' : ''}${chenhLech.toFixed(2)}</b> điểm</p>
                    <div class="status-badge ${danhGiaClass}">${danhGiaText}</div>
                </div>
            `;

            // Lưu lịch sử tính điểm vào Backend CSDL
            await fetch('https://iuh-admission-api.onrender.com/api/save-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    major_id: maNganhDuocChon,
                    final_score: tongDiemMax,
                    status: chenhLech >= 0.75 ? 'SAFE' : (chenhLech >= -0.5 ? 'CONSIDER' : 'RISK')
                })
            });

            // Tự động tải lại bảng Lịch sử tính điểm mới nhất trên giao diện
            taiLichSuTinhDiem();
        }
    } catch (err) {
        console.error("Lỗi lấy điểm chuẩn từ Server:", err);
    }

    // 5. Đổ kết quả ra giao diện
    document.getElementById('chiTietPhuongThuc').innerHTML = htmlChiTiet || "<i>Không có phương thức nào hợp lệ. Vui lòng kiểm tra lại điểm số nhập vào!</i>";
    document.getElementById('diemMax').innerText = tongDiemMax.toFixed(2);

    if (htmlSoSanh) {
        document.getElementById('chiTietPhuongThuc').innerHTML += htmlSoSanh;
    }

    document.getElementById('ketQuaBox').style.display = "block";
}

// --- HÀM MỚI THÊM: Xóa toàn bộ lịch sử tính điểm ---
async function xoaLichSuTinhDiem() {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử tính điểm không?")) {
        return; // Người dùng bấm Hủy
    }

    try {
        const res = await fetch('https://iuh-admission-api.onrender.com/api/history', {
            method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
            alert("Đã xóa sạch lịch sử!");
            taiLichSuTinhDiem(); // Tải lại giao diện lịch sử trống
        } else {
            alert("Lỗi: " + (data.error || "Không thể xóa!"));
        }
    } catch (err) {
        console.error("Lỗi khi xóa lịch sử:", err);
        alert("Lỗi kết nối Server!");
    }
}