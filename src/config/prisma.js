require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const url = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 4000,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.substring(1),

    // TiDB Cloud requires TLS
    ssl: {
        rejectUnauthorized: true,
    },

    connectionLimit: 5,
});

const prisma = new PrismaClient({
    adapter,
});

module.exports = prisma;