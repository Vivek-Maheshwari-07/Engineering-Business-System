// 1️⃣ Import express
const express = require("express");

// 2️⃣ Create express app
const app = express();

// 3️⃣ Define PORT
const PORT = 5000;

// 4️⃣ Basic test route
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// 5️⃣ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});