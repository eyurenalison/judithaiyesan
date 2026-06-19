#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const adminEmail = "info@judithaiyesan.com";
const adminPassword = "JAiYesan1235#";

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  console.log("Admin Credentials:");
  console.log("================");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log("");
  console.log("Add these to your .env file:");
  console.log("================");
  console.log(`ADMIN_EMAIL="${adminEmail}"`);
  console.log(`ADMIN_PASSWORD_HASH="${passwordHash}"`);
}

seedAdmin().catch((error) => {
  console.error("Error generating admin credentials:", error);
  process.exit(1);
});
