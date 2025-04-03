import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createblog, updatedBlog } from "../types";

export const blogRoutes = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRoutes.use("/*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    console.log(user.id);
    if (user) {
      c.set("userId", user.id as string);
      await next();
    } else {
      c.status(401);
      return c.json({
        status: "failed",
        data: "You are not logged in",
      });
    }
  } catch (error) {
    c.status(401);
    return c.json({
      status: "failed",
      data: "You are not logged in",
    });
  }
});

blogRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createblog.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });

    c.status(201);
    return c.json({
      status: "success",
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
});

blogRoutes.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updatedBlog.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const updatedBlog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    c.status(200);
    return c.json({
      status: "success",
      updatedBlog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
});

blogRoutes.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany();
    c.status(200);
    return c.json({
      status: "success",
      blogs,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
});

blogRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
    });

    c.status(200);
    return c.json({
      status: "success",
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({
      status: "failed",
      data: "Please provide correct inputs",
    });
  }
});
