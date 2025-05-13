import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let dbError = null;

// Function to check database connection
async function checkDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    dbError = null; // Reset error if connection succeeds
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    dbError = error.message;
  }
}

// Function to release idle connections
async function releaseIdleConnections() {
  try {
    const [connections] = await pool.query("SHOW PROCESSLIST");
    for (let conn of connections) {
      if (conn.Command === "Sleep") {
        await pool.query(`KILL ${conn.Id}`);
        console.log(`🔴 Closed idle connection: ${conn.Id}`);
      }
    }
  } catch (error) {
    console.error("⚠ Error releasing idle connections:", error.message);
  }
}

// Run connection check on startup
checkDBConnection();

// Automatically release idle connections every 5 minutes
setInterval(releaseIdleConnections, 5 * 60 * 1000);

// Function to get the connection status
function getDBStatus() {
  return dbError ? `❌ Error: ${dbError}` : "✅ Database is connected";
}

export { pool, getDBStatus };
