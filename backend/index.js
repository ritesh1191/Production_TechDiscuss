const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.js");
const userRoute = require("./routes/users.js");
const postRoute = require("./routes/posts.js");
const commentRoute = require("./routes/comments.js");
const fs = require('fs');

// Load environment variables first
dotenv.config();

// Create images directory if it doesn't exist
if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

// database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to database successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);  // Exit if database connection fails
  }
};

// middlewares
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://tech-discuss-frontend.onrender.com"  // Add your actual frontend URL here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  exposedHeaders: ['*', 'Authorization']
}));

// Configure cookie settings
app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// ✅ Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK"
  });
});

// Image Upload
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "images");
  },
  filename: (req, file, fn) => {
    fn(null, req.body.img);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("Image has been uploaded successfully!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on Port ${PORT}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
});
