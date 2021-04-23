const configDb = {
  database: process.env.DB_NAME || "iot_db",
  username: process.env.DB_USER || "iot",
  password: process.env.DB_PASS || "iot",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  dialect: process.env.DB_DIAL || "postgres",
  logging: false, // Loggin for seialize
};

const configRedis = {
  host: "127.0.0.1", // Redis host
  port: 6379, // Redis port
  db: 0,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
};

module.exports = { configDb, configRedis };
