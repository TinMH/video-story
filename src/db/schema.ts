import { pgTable, uuid, varchar, integer, text, boolean, jsonb, timestamp, pgEnum, decimal, bigint } from 'drizzle-orm/pg-core';

// Enums
export const userPlanEnum = pgEnum('user_plan', ['free', 'pro', 'enterprise']);
export const projectStatusEnum = pgEnum('project_status', ['draft', 'processing', 'completed', 'failed']);
export const genStatusEnum = pgEnum('gen_status', ['queued', 'preparing', 'generating_image', 'generating_video', 'upscaling', 'completed', 'failed']);
export const fileTypeEnum = pgEnum('file_type', ['reference', 'image_base', 'video_preview', 'video_final', 'thumbnail']);
export const exportStatusEnum = pgEnum('export_status', ['pending', 'processing', 'completed', 'failed']);

// Tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  plan: userPlanEnum('plan').default('free'),
  credits: integer('credits').default(100),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  status: projectStatusEnum('status').default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userPrompt: text('user_prompt').notNull(),
  generatedScript: text('generated_script'),
  llmProvider: varchar('llm_provider', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  referenceImageUrl: text('reference_image_url'),
  thumbnailUrl: text('thumbnail_url'),
  gender: varchar('gender', { length: 50 }),
  age: integer('age'),
  featuresMetadata: jsonb('features_metadata').default({}),
  seed: bigint('seed', { mode: 'number' }).default(-1),
  isFavorite: boolean('is_favorite').default(false),
  aiEmbeddings: jsonb('ai_embeddings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const styles = pgTable('styles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  prompt: text('prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  storyId: uuid('story_id').references(() => stories.id, { onDelete: 'cascade' }),
  sceneOrder: integer('scene_order').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  backgroundPrompt: text('background_prompt').notNull(),
  storyNarration: text('story_narration'),
  configMetadata: jsonb('config_metadata').default({}),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const props = pgTable('props', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }),
  prompt: text('prompt').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const motions = pgTable('motions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  motionPrompt: text('motion_prompt').notNull(),
  cameraMovement: varchar('camera_movement', { length: 100 }),
  defaultIntensity: decimal('default_intensity', { precision: 3, scale: 2 }).default('1.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const generations = pgTable('generations', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, { onDelete: 'set null' }),
  sceneId: uuid('scene_id').references(() => scenes.id, { onDelete: 'set null' }),
  motionId: uuid('motion_id').references(() => motions.id, { onDelete: 'set null' }),
  styleId: uuid('style_id').references(() => styles.id, { onDelete: 'set null' }),
  status: genStatusEnum('status').default('queued'),
  progress: integer('progress').default(0),
  compiledPromptMetadata: jsonb('compiled_prompt_metadata').notNull(),
  provider: varchar('provider', { length: 50 }),
  modelName: varchar('model_name', { length: 100 }),
  costCredits: integer('cost_credits').default(0),
  generationTimeSeconds: integer('generation_time_seconds'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const generatedFiles = pgTable('generated_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  generationId: uuid('generation_id').notNull().references(() => generations.id, { onDelete: 'cascade' }),
  type: fileTypeEnum('type').notNull(),
  url: text('url').notNull(),
  width: integer('width'),
  height: integer('height'),
  durationSeconds: decimal('duration_seconds', { precision: 4, scale: 2 }),
  fps: integer('fps'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const timeline = pgTable('timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').notNull(),
  generatedFileId: uuid('generated_file_id').notNull().references(() => generatedFiles.id, { onDelete: 'cascade' }),
  durationSeconds: decimal('duration_seconds', { precision: 4, scale: 2 }).default('3.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const exports = pgTable('exports', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  videoUrl: text('video_url'),
  status: exportStatusEnum('status').default('pending'),
  resolution: varchar('resolution', { length: 20 }).default('1080x1920'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Flows table representing the visual flow diagrams
export const flows = pgTable('flows', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('draft'),
  runs: integer('runs').default(0),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0.00'),
  nodes: jsonb('nodes').notNull().default([]),
  edges: jsonb('edges').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
