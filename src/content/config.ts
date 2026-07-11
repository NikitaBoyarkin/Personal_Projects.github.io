import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero: z.string(),
    impact: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    github: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts };
