import { Hono } from "hono";
import { sign } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { userRoutes } from "./routes/user";
import { blogRoutes } from "./routes/blog";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.get("/", (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  return c.text("Hello Hono!");
});

app.route("/api/v1/user", userRoutes);
app.route("/api/v1/blog", blogRoutes);

app.get("/api/v1/user", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const users = await prisma.user.findMany();
    console.log(users);
    return c.json({
      users,
    });
  } catch (error) {
    return c.text("Invalid!");
  }
});

export default app;
