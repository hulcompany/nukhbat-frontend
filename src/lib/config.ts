export const config = {
  // Pulls from your .env.local file, falls back to localhost if not found
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",

  // You can easily add other global settings here later!
  appName: "النخبة الأوائل",
  apiTimeout: 10000, // 10 seconds
};
