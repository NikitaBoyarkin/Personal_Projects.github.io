import { defineCollection, z } from 'astro:content';

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  hero: z.string(),
  impact: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  github: z.string().url().optional(),
  demo: z.string().optional(),
  related: z.array(z.string()).default([]),
  children: z.array(z.string()).default([]),
  date: z.coerce.date().optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  caseStudy: z
    .object({
      problem: z.string(),
      approach: z.string(),
      result: z.string(),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    })
    .optional(),
  draft: z.boolean().default(false),
  private: z.boolean().default(false),
});

const voltaPartSchema = z.object({
  title: z.string(),
  description: z.string(),
  part: z.string(),
  order: z.number(),
  impact: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  github: z.string().url().optional(),
  draft: z.boolean().default(false),
});

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  excerpt: z.string(),
  image: z.string().optional(),
  related: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const projects = defineCollection({ schema: projectSchema });
const projectsEn = defineCollection({ schema: projectSchema });
const voltaParts = defineCollection({ schema: voltaPartSchema });
const voltaPartsEn = defineCollection({ schema: voltaPartSchema });
const posts = defineCollection({ schema: postSchema });

export const collections = {
  projects,
  'projects-en': projectsEn,
  'volta-parts': voltaParts,
  'volta-parts-en': voltaPartsEn,
  posts,
};