import "dotenv/config";
import bcrypt from "bcryptjs";
import { getPrisma } from "../app/lib/db";

const prisma = getPrisma();

const adminEmail = "info@judithaiyesan.com";
const adminPassword = "Admin123!";

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    create: {
      email: adminEmail,
      name: "Administrator",
      passwordHash,
    },
    update: {
      active: true,
      name: "Administrator",
      passwordHash,
    },
    where: { email: adminEmail },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log(`Admin user seeded: ${adminEmail}`);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });