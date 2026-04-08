#!/usr/bin/env node
/**
 * GoHigher — Appwrite Database Setup Script
 * Run: node scripts/setup-appwrite.js
 *
 * Requires: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY in env
 */

const {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} = require("appwrite");

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1",
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

client.headers["X-Appwrite-Key"] =
  process.env.NEXT_PUBLIC_APPWRITE_API_KEY ||
  "standard_57731590f37adf3ce82fe75df097a32bd25c0d8e2ec58fd99a2fd2869a0353a944386fd62428c0e755160f7a09aec2934dd7781edfdb9d824238225e955c64710f680b4d183956f90eacc1d08d86fe11a06c47e163aab7bd1d002b8b780aea9a09f356bdeb3e567bee4d3e8e64571b8272b53a397d67bd259a1da9bc769cd936";

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = "gohigher-db";
const STORAGE_ID = "gohigher-storage";

const permissions = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

async function setup() {
  console.log("🌿 Setting up GoHigher Appwrite backend...\n");

  // Create database
  try {
    await databases.create(DB_ID, "GoHigher Database");
    console.log("✅ Database created");
  } catch (e) {
    console.log("ℹ️  Database exists");
  }

  // Create storage bucket
  try {
    await storage.createBucket(
      STORAGE_ID,
      "GoHigher Storage",
      permissions,
      false,
      false,
      10485760,
      ["jpg", "jpeg", "png", "webp", "gif"],
    );
    console.log("✅ Storage bucket created");
  } catch (e) {
    console.log("ℹ️  Storage bucket exists");
  }

  const collections = [
    {
      id: "users",
      name: "Users",
      attrs: [
        { key: "name", type: "string", size: 100, required: true },
        { key: "email", type: "string", size: 200, required: true },
        { key: "role", type: "string", size: 20, required: true },
      ],
    },
    {
      id: "reports",
      name: "Reports",
      attrs: [
        { key: "user_id", type: "string", size: 50, required: true },
        { key: "description", type: "string", size: 1000, required: true },
        { key: "image", type: "string", size: 100, required: false },
        { key: "location", type: "string", size: 200, required: true },
        { key: "status", type: "string", size: 20, required: true },
      ],
    },
    {
      id: "garbage_requests",
      name: "GarbageRequests",
      attrs: [
        { key: "user_id", type: "string", size: 50, required: true },
        { key: "waste_type", type: "string", size: 100, required: true },
        { key: "date", type: "string", size: 30, required: true },
        { key: "status", type: "string", size: 20, required: true },
      ],
    },
    {
      id: "hotspots",
      name: "Hotspots",
      attrs: [
        { key: "location", type: "string", size: 200, required: true },
        {
          key: "severity_level",
          type: "integer",
          required: true,
          min: 1,
          max: 5,
        },
        { key: "report_count", type: "integer", required: true, min: 0 },
      ],
    },
    {
      id: "products",
      name: "Products",
      attrs: [
        { key: "vendor_id", type: "string", size: 50, required: true },
        { key: "name", type: "string", size: 200, required: true },
        { key: "description", type: "string", size: 1000, required: true },
        { key: "price", type: "float", required: true, min: 0 },
        { key: "image", type: "string", size: 100, required: false },
      ],
    },
    {
      id: "articles",
      name: "Articles",
      attrs: [
        { key: "author_id", type: "string", size: 50, required: true },
        { key: "title", type: "string", size: 300, required: true },
        { key: "content", type: "string", size: 50000, required: true },
      ],
    },
    {
      id: "messages",
      name: "Messages",
      attrs: [
        { key: "user_id", type: "string", size: 50, required: true },
        { key: "message", type: "string", size: 5000, required: true },
        { key: "response", type: "string", size: 5000, required: false },
      ],
    },
  ];

  for (const col of collections) {
    try {
      await databases.createCollection(DB_ID, col.id, col.name, permissions);
      console.log(`✅ Collection "${col.name}" created`);
    } catch {
      console.log(`ℹ️  Collection "${col.name}" exists`);
    }

    for (const attr of col.attrs) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DB_ID,
            col.id,
            attr.key,
            attr.size,
            attr.required ?? false,
          );
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DB_ID,
            col.id,
            attr.key,
            attr.required ?? false,
            attr.min,
            attr.max,
          );
        } else if (attr.type === "float") {
          await databases.createFloatAttribute(
            DB_ID,
            col.id,
            attr.key,
            attr.required ?? false,
            attr.min,
          );
        }
        console.log(`  → Attribute "${attr.key}" added`);
      } catch {
        console.log(`  ↩ Attribute "${attr.key}" exists`);
      }
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log("\n🎉 Setup complete! GoHigher backend is ready.");
  console.log("\nNext steps:");
  console.log("1. Copy .env.local.example to .env.local");
  console.log("2. Fill in your NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  console.log("3. Run: npm install && npm run dev");
}

setup().catch(console.error);
