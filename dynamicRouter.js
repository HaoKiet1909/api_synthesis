const express = require("express");
const { pool } = require("./connect.js"); // Import pool từ connect.js
const router = express.Router();
const cors = require("cors");

router.use(cors());
router.use(express.json());

// Hàm sinh endpoint động
async function generateRoutes() {
  try {
    // Lấy danh sách endpoint từ bảng APIEndpoints
    const query = `
      SELECT route_name, procedure_name, parameters 
      FROM api_synthesis 
      WHERE status = true
    `;
    const result = await pool.query(query); // Dùng pool.query() để thực thi truy vấn
    const endpoints = result.rows; // Lấy dữ liệu từ rows

    // Xóa tất cả các route cũ trong router
    router.stack = []; // Xóa toàn bộ middleware trước đó

    // Tạo route GET cho từng endpoint
    endpoints.forEach((endpoint) => {
      const { route_name, procedure_name, parameters } = endpoint;

      router.get(route_name, async (req, res) => {
        try {
          let sqlString;

          // Kiểm tra nếu không có params
          if (!parameters || parameters === "{}") {
            sqlString = `SELECT * FROM ${procedure_name}()`; // Hàm không có tham số
          } else {
            const params = JSON.parse(parameters);

            // Xây dựng truy vấn SQL với tham số
            const paramValues = Object.entries(params)
              .map(([key, type]) => {
                const value = req.query[key];
                if (!value) return "NULL"; // Nếu không có giá trị, gán NULL
                if (type === "string" || type === "uuid") return `'${value}'`;
                return value; // Giá trị số hoặc ngày
              })
              .join(", ");

            sqlString = `SELECT * FROM ${procedure_name}(${paramValues})`;
          }

          console.log(`Executing SQL: ${sqlString}`);
          const data = await pool.query(sqlString); // Thực thi truy vấn
          res.json(data.rows);
        } catch (err) {
          console.error(`Error processing ${route_name}:`, err);
          res.status(500).send({ error: "Lỗi trong quá trình xử lý truy vấn." });
        }
      });

      //console.log(`Endpoint ${route_name} đã được tạo.`);
    });
  } catch (err) {
    console.error("Lỗi khi tạo endpoint:", err);
  }
}

// Cập nhật endpoint mỗi phút
setInterval(() => {
  //console.log("Đang kiểm tra và cập nhật endpoint...");
  generateRoutes();
}, 60000); // 1 phút (60000ms)

// Xuất router để sử dụng trong index.js
module.exports = router;

// Tạo router lần đầu tiên khi server khởi chạy
generateRoutes();
