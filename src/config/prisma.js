require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaTiDBCloud } = require("@tidbcloud/prisma-adapter");

const adapter = new PrismaTiDBCloud({
    url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

module.exports = prisma;