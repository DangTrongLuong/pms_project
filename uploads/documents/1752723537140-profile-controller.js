const pool = require("../config/db");

// Cập nhật thông tin profile người dùng
exports.updateProfile = async (req, res) => {
  try {
    // Bước 1: Lấy thông tin từ request
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    console.log("Received profile update request:", { id, firstName, lastName, email }); // Debug log

    // Bước 2: Validate dữ liệu đầu vào
    if (!id || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Bước 3: Kiểm tra email đã tồn tại (trừ chính user hiện tại)
    const [existing] = await pool.execute(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Bước 4: Kiểm tra bản ghi tồn tại
    const [userCheck] = await pool.execute(
      `SELECT id FROM users WHERE id = ?`,
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Bước 5: Thực hiện cập nhật
    const [result] = await pool.execute(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?`,
      [firstName, lastName, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Không thể cập nhật thông tin" });
    }

    // Bước 6: Lấy và trả về dữ liệu đã cập nhật
    const [updatedUser] = await pool.execute(
      `SELECT id, first_name, last_name, email FROM users WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Cập nhật thông tin thành công",
      id: updatedUser[0].id,
      firstName: updatedUser[0].first_name,
      lastName: updatedUser[0].last_name,
      email: updatedUser[0].email,
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error.stack);
    res.status(500).json({ message: "Lỗi server", error: error.stack });
  }
};