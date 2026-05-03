const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking DB connection...");
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);

    const testEmail = `test_${Date.now()}@example.com`;
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`Attempting to create test user: ${testEmail}`);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        hashedPassword: hashedPassword,
      },
    });

    console.log("Test user created successfully:", user.id);

    console.log("Cleaning up...");
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleanup successful.");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
