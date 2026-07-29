import { db } from './index';
import { users, flows, styles } from './schema';
import { mockFlows } from '../data/mockFlows';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Seed a default user if none exists
    const defaultEmail = 'dev@aistory.ai';
    let userList = await db.select().from(users);
    let devUser = userList.find(u => u.email === defaultEmail);

    if (!devUser) {
      console.log('Inserting default developer user...');
      const [insertedUser] = await db.insert(users).values({
        email: defaultEmail,
        passwordHash: 'dummy_hash', // In production, bcrypt-hashed
        name: 'Developer User',
        plan: 'enterprise',
        credits: 1000,
      }).returning();
      devUser = insertedUser;
    }
    console.log(`Developer user: ${devUser.name} (${devUser.id})`);

    // 2. Seed mock styles if none exist
    let styleList = await db.select().from(styles);
    if (styleList.length === 0) {
      console.log('Inserting default styles...');
      await db.insert(styles).values([
        {
          name: 'Cinematic Studio',
          prompt: 'High-end wireless headphones resting on a minimalist concrete table, soft dramatic studio lighting, depth of field, 8k resolution',
          negativePrompt: 'blurry, low quality, noise, grain, text, watermark',
          isPublic: true,
        },
        {
          name: 'Cyberpunk Neon',
          prompt: 'Glowing holographic DNA strands inside a futuristic laboratory, dark synthwave ambient, vibrant purple and cyan colors',
          negativePrompt: 'bright daylight, sunny, natural light, low quality',
          isPublic: true,
        }
      ]);
    }

    // 3. Seed mock flows if none exist
    let flowList = await db.select().from(flows);
    if (flowList.length === 0) {
      console.log('Inserting default flows...');
      for (const flow of mockFlows) {
        // Strip out onDataChange functions from nodes if any
        const cleanedNodes = flow.nodes.map(({ data, ...node }) => {
          const { onDataChange, ...restData } = data as any;
          return { ...node, data: restData };
        });

        await db.insert(flows).values({
          id: flow.id,
          name: flow.name,
          description: flow.description,
          status: flow.status,
          runs: flow.runs,
          successRate: flow.successRate.toString(),
          nodes: cleanedNodes,
          edges: flow.edges,
        });
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
  process.exit(0);
}

main();
