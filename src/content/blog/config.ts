import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    state: z.string(), // Este campo conectará con el mapa
    date: z.date(),
    image: z.string().optional(),
    description: z.string(),
  }),
});

export const collections = { blog };