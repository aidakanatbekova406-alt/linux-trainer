
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Не задан JWT_SECRET в .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: "32kb" }));

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "linux_trainer",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

function createToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Требуется авторизация",
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Недействительный токен",
    });
  }
}

// Проверка API
app.get("/", (_req, res) => {
  res.send("Linux Trainer API is running!");
});

// Проверка PostgreSQL
app.get("/api/db-test", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      success: true,
      message: "Подключение к PostgreSQL успешно!",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Ошибка PostgreSQL:", error.message);

    res.status(500).json({
      success: false,
      message: "Не удалось подключиться к PostgreSQL",
    });
  }
});

// Регистрация
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Укажи имя пользователя и пароль",
      });
    }

    const cleanUsername = username.trim();

    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 50
    ) {
      return res.status(400).json({
        message:
          "Имя пользователя должно быть от 3 до 50 символов",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Пароль должен содержать минимум 8 символов",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username`,
      [cleanUsername, passwordHash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Аккаунт создан",
      user,
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Это имя пользователя уже занято",
      });
    }

    console.error("Ошибка регистрации:", error.message);

    res.status(500).json({
      message: "Не удалось создать аккаунт",
    });
  }
});

// Вход
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Укажи имя пользователя и пароль",
      });
    }

    const result = await pool.query(
      `SELECT id, username, password_hash
       FROM users
       WHERE username = $1`,
      [username.trim()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Неверное имя пользователя или пароль",
      });
    }

    res.json({
      message: "Вход выполнен",
      user: {
        id: user.id,
        username: user.username,
      },
      token: createToken(user),
    });
  } catch (error) {
    console.error("Ошибка входа:", error.message);

    res.status(500).json({
      message: "Не удалось выполнить вход",
    });
  }
});

// Получить прогресс пользователя
app.get("/api/progress", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         command_name,
         learned,
         correct_answers,
         wrong_answers,
         last_reviewed,
         next_review
       FROM user_progress
       WHERE user_id = $1
       ORDER BY command_name`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения прогресса:", error.message);

    res.status(500).json({
      message: "Не удалось получить прогресс",
    });
  }
});

// Сохранить прогресс команды
app.post("/api/progress", authenticateToken, async (req, res) => {
  try {
    const {
      command_name,
      learned = false,
      correct_answers = 0,
      wrong_answers = 0,
      next_review = null,
    } = req.body;

    if (
      typeof command_name !== "string" ||
      !command_name.trim() ||
      command_name.length > 100 ||
      typeof learned !== "boolean" ||
      !Number.isInteger(correct_answers) ||
      correct_answers < 0 ||
      !Number.isInteger(wrong_answers) ||
      wrong_answers < 0 ||
      !(
        next_review === null ||
        (
          typeof next_review === "string" &&
          !Number.isNaN(Date.parse(next_review))
        )
      )
    ) {
      return res.status(400).json({
        message: "Некорректные данные",
      });
    }

    const result = await pool.query(
      `INSERT INTO user_progress
         (
           user_id,
           command_name,
           learned,
           correct_answers,
           wrong_answers,
           last_reviewed,
           next_review
         )
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
       ON CONFLICT (user_id, command_name)
       DO UPDATE SET
         learned = user_progress.learned OR EXCLUDED.learned,
         correct_answers = EXCLUDED.correct_answers,
         wrong_answers = EXCLUDED.wrong_answers,
         last_reviewed = CURRENT_TIMESTAMP,
         next_review = EXCLUDED.next_review
       RETURNING
         command_name,
         learned,
         correct_answers,
         wrong_answers,
         last_reviewed,
         next_review`,
      [
        req.user.userId,
        command_name.trim(),
        learned,
        correct_answers,
        wrong_answers,
        next_review,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка сохранения прогресса:", error.message);

    res.status(500).json({
      message: "Не удалось сохранить прогресс",
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});