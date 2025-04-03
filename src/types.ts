import z from "zod";

export const signupInput = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const signinInput = z.object({
  username: z.string().email(),
  password: z.string().min(6),
});

export const createblog = z.object({
  title: z.string(),
  content: z.string(),
});

export const updatedBlog = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
});
