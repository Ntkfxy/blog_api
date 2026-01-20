// ดึงฟังก์ชัน createClient จากไลบรารี supabase-js
// ใช้สำหรับสร้าง client เพื่อเชื่อมต่อกับ Supabase
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// สร้าง Supabase client
// พารามิเตอร์ตัวที่ 1: URL ของโปรเจกต์ Supabase
// พารามิเตอร์ตัวที่ 2: Service Role Key (มีสิทธิ์สูงมาก ข้าม RLS ได้)
const supabase = createClient(
  process.env.SUPABASE_URL,              // URL ของ Supabase (เก็บใน .env)
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service Role Key (ใช้เฉพาะ backend)
);



// export supabase client
// เพื่อให้ไฟล์อื่นสามารถ import ไปใช้งานได้
module.exports = supabase;
