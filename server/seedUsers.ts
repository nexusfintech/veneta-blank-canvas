import { storage } from "./storage";

async function seedUsers() {
  console.log("Initializing users...");

  try {
    // Check if users already exist
    const adminUser = await storage.getUserByEmail("mauro.frasson@venetagroup.com");
    const normalUser = await storage.getUserByEmail("app@nexusfintech.it");

    if (!adminUser) {
      await storage.createUser({
        email: "mauro.frasson@venetagroup.com",
        password: "Admin123!",
        role: "admin",
        firstName: "Mauro",
        lastName: "Frasson",
      });
      console.log("✅ Admin user created: mauro.frasson@venetagroup.com / Admin123!");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    if (!normalUser) {
      await storage.createUser({
        email: "app@nexusfintech.it",
        password: "User123!",
        role: "user",
        firstName: "User",
        lastName: "Nexus",
      });
      console.log("✅ Normal user created: app@nexusfintech.it / User123!");
    } else {
      console.log("ℹ️ Normal user already exists");
    }

    console.log("Users initialization completed!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

// Run seed if this file is executed directly
import { fileURLToPath } from 'url';
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => process.exit(0));
}

export { seedUsers };