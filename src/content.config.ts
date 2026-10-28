import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One .mdx file per case study.
const work = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().optional(),
    description: z.string().max(160),
    client: z.string(),
    role: z.string(),
    dates: z.string(),
    stack: z.array(z.string()).min(1),
    outcome: z.string(),
    code: z.url().optional(),
  }),
});

// One .md file per home page entry.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z
    .object({
      title: z.string(),
      tier: z.enum(['case-study', 'short']),
      order: z.number(),
      client: z.string(),
      year: z.string().regex(/^\d{4}$/),
      stack: z.array(z.string()).min(1),
      caseStudy: reference('work').optional(),
      linkLabel: z.string().optional(),
    })
    .refine((d) => !d.caseStudy || Boolean(d.linkLabel), {
      error: 'linkLabel is required when caseStudy is set',
      path: ['linkLabel'],
    }),
});

// One resume.yaml. Strict, so a stray key (a phone number, say) fails the build.
const resume = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/resume' }),
  schema: z.strictObject({
    contact: z.strictObject({
      name: z.string(),
      title: z.string(),
      region: z.string(),
      email: z.email(),
      website: z.string(),
      github: z.string(),
      linkedin: z.string(),
    }),
    summary: z.string(),
    summaryClosing: z.string().optional(),
    experience: z.array(
      z.strictObject({
        title: z.string(),
        organization: z.string(),
        location: z.string(),
        dates: z.string(),
        bullets: z.array(z.string()).min(1),
      }),
    ),
    projects: z.array(
      z.strictObject({
        name: z.string(),
        kind: z.string(),
        year: z.string().regex(/^\d{4}$/),
        link: z.string().optional(),
        bullets: z.array(z.string()).min(1),
      }),
    ),
    skills: z.array(
      z.strictObject({
        label: z.string(),
        items: z.string(),
      }),
    ),
    education: z.array(
      z.strictObject({
        degree: z.string(),
        school: z.string(),
        location: z.string(),
        dates: z.string(),
        bullets: z.array(z.string()).optional(),
      }),
    ),
  }),
});

export const collections = { work, projects, resume };
