import { Hono } from "hono";
import { sign } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { signinInput, signupInput } from "../types";

export const userRoutes = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRoutes.post("/signin", async (c) => {
  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);

  if (!success) {
    c.status(401);
    return c.json({
      status: "failed",
      data: "Please provide correct credentials",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    console.log(body);
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
      omit: {
        password: true,
      },
    });
    if (!user) {
      c.status(401);
      return c.json({
        status: "failed",
        data: "Please provide correct credentials",
      });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    // console.log(token);
    c.status(200);
    return c.json({
      status: "success",
      token,
      data: user,
    });
  } catch (error) {
    console.log(error);
    c.status(401);
    return c.json({
      status: "failed",
      data: "Please provide correct credentials",
    });
  }
});

userRoutes.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);

  if (!success) {
    c.status(401);
    return c.json({
      status: "failed",
      data: "Please provide correct credentials",
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    console.log(body);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
      omit: {
        password: true,
      },
    });

    // const payload = {
    //   sub: user.id,
    //   exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 5 minutes
    // };
    // const token = await sign({ id: user?.id }, c.env.JWT_SECRET);
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log(token);
    c.status(201);
    return c.json({
      status: "success",
      token,
      data: user,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({
      status: "failed",
      message: "Please provide correct credentials",
    });
  }
});
