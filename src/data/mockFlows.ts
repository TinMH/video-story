import type { Node, Edge } from '@xyflow/react';

export interface Flow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft';
  runs: number;
  successRate: number;
  lastUpdated: string;
  nodes: Node[];
  edges: Edge[];
}

export const mockFlows: Flow[] = [
  {
    id: 'flow-1',
    name: 'AI Product Promo Generator',
    description: 'Automates product promo video creation: Scriptwriting -> Voice Synthesis -> AI Product B-roll -> Video Compilation.',
    status: 'active',
    runs: 342,
    successRate: 98.8,
    lastUpdated: '2 hours ago',
    nodes: [
      {
        id: 'node-script',
        type: 'scriptNode',
        position: { x: 50, y: 150 },
        data: {
          title: 'AI Script Generator',
          prompt: 'Create a 15-second energetic promo script for premium noise-canceling headphones named "AuraSound". Focus on deep bass and active noise canceling.',
          temperature: 0.7,
          maxLength: 100,
          status: 'idle',
        },
      },
      {
        id: 'node-voice',
        type: 'voiceNode',
        position: { x: 300, y: 50 },
        data: {
          title: 'Voiceover Synthesis',
          voiceId: 'adam-us',
          voiceName: 'Adam (US - Confident)',
          speed: 1.05,
          pitch: 1.0,
          status: 'idle',
        },
      },
      {
        id: 'node-image',
        type: 'imageNode',
        position: { x: 300, y: 250 },
        data: {
          title: 'AI Image Generator',
          style: 'cinematic-studio',
          aspectRatio: '16:9',
          promptTemplate: 'High-end wireless headphones resting on a minimalist concrete table, soft dramatic studio lighting, depth of field, 8k resolution',
          status: 'idle',
        },
      },
      {
        id: 'node-video',
        type: 'videoNode',
        position: { x: 550, y: 250 },
        data: {
          title: 'AI Video Renderer',
          motionIntensity: 6,
          cameraMovement: 'zoom-in-slow',
          fps: 30,
          status: 'idle',
        },
      },
      {
        id: 'node-compiler',
        type: 'compilerNode',
        position: { x: 800, y: 150 },
        data: {
          title: 'Video Compiler',
          resolution: '1080p',
          subtitleStyle: 'impact-yellow',
          musicVolume: 0.15,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'edge-s-v', source: 'node-script', target: 'node-voice', animated: false },
      { id: 'edge-s-i', source: 'node-script', target: 'node-image', animated: false },
      { id: 'edge-i-v', source: 'node-image', target: 'node-video', animated: false },
      { id: 'edge-v-c', source: 'node-video', target: 'node-compiler', animated: false },
      { id: 'edge-vo-c', source: 'node-voice', target: 'node-compiler', animated: false },
    ],
  },
  {
    id: 'flow-2',
    name: 'TikTok News Reels',
    description: 'Scrapes and summarizes tech news, generates engaging narrations, adds neon cyberpunk visuals, and adds dynamic captions.',
    status: 'active',
    runs: 1205,
    successRate: 99.4,
    lastUpdated: '1 day ago',
    nodes: [
      {
        id: 'node-script',
        type: 'scriptNode',
        position: { x: 50, y: 150 },
        data: {
          title: 'Tech News Scraper',
          prompt: 'Scrape the latest breaking news about AI breakthroughs in medical science and write a thrilling hooks-focused video script.',
          temperature: 0.85,
          maxLength: 150,
          status: 'idle',
        },
      },
      {
        id: 'node-voice',
        type: 'voiceNode',
        position: { x: 300, y: 50 },
        data: {
          title: 'Voiceover Synthesis',
          voiceId: 'bella-cyber',
          voiceName: 'Bella (UK - Cyberpunk)',
          speed: 1.15,
          pitch: 1.05,
          status: 'idle',
        },
      },
      {
        id: 'node-image',
        type: 'imageNode',
        position: { x: 300, y: 250 },
        data: {
          title: 'AI Cyberpunk Art',
          style: 'cyberpunk-neon',
          aspectRatio: '9:16',
          promptTemplate: 'Glowing holographic DNA strands inside a futuristic laboratory, dark synthwave ambient, vibrant purple and cyan colors',
          status: 'idle',
        },
      },
      {
        id: 'node-video',
        type: 'videoNode',
        position: { x: 550, y: 250 },
        data: {
          title: 'Video Animator',
          motionIntensity: 8,
          cameraMovement: 'pan-right-fast',
          fps: 30,
          status: 'idle',
        },
      },
      {
        id: 'node-compiler',
        type: 'compilerNode',
        position: { x: 800, y: 150 },
        data: {
          title: 'Reels Compiler',
          resolution: '9:16-vertical',
          subtitleStyle: 'neon-border',
          musicVolume: 0.2,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'edge-s-v', source: 'node-script', target: 'node-voice', animated: false },
      { id: 'edge-s-i', source: 'node-script', target: 'node-image', animated: false },
      { id: 'edge-i-v', source: 'node-image', target: 'node-video', animated: false },
      { id: 'edge-v-c', source: 'node-video', target: 'node-compiler', animated: false },
      { id: 'edge-vo-c', source: 'node-voice', target: 'node-compiler', animated: false },
    ],
  },
  {
    id: 'flow-3',
    name: 'Blog Post to Video Explainer',
    description: 'Draft workflow for summarizing long-form blog articles into 1-minute whiteboard-style explanation videos.',
    status: 'draft',
    runs: 0,
    successRate: 0.0,
    lastUpdated: 'Just now',
    nodes: [
      {
        id: 'node-script',
        type: 'scriptNode',
        position: { x: 100, y: 150 },
        data: {
          title: 'Blog Article Summarizer',
          prompt: 'Paste your URL here to outline and write key educational scripts...',
          temperature: 0.5,
          maxLength: 300,
          status: 'idle',
        },
      },
      {
        id: 'node-voice',
        type: 'voiceNode',
        position: { x: 380, y: 150 },
        data: {
          title: 'Voiceover Synthesis',
          voiceId: 'serena-edu',
          voiceName: 'Serena (US - Friendly)',
          speed: 1.0,
          pitch: 1.0,
          status: 'idle',
        },
      },
    ],
    edges: [
      { id: 'edge-s-v', source: 'node-script', target: 'node-voice', animated: false },
    ],
  },
];

export const flowTemplates = [
  {
    id: 'tpl-1',
    name: 'AI Video Promo (Standard)',
    description: 'Perfect for selling products or services. Chains text, voice, visuals, animations, and overlays.',
    nodesCount: 5,
    category: 'E-commerce',
  },
  {
    id: 'tpl-2',
    name: 'Social Shorts/Reels (Vertical)',
    description: 'Geared towards high engagement. Highlights fast voice, neon visuals, and prominent animated subtitles.',
    nodesCount: 5,
    category: 'Social Media',
  },
  {
    id: 'tpl-3',
    name: 'Quick Script-to-Audio Podcaster',
    description: 'Simplified pipeline that turns long text drafts into high-quality spoken audio segments.',
    nodesCount: 2,
    category: 'Audio Only',
  },
  {
    id: 'tpl-4',
    name: 'Empty Flow Canvas',
    description: 'Start from scratch. Add nodes and wire them manually.',
    nodesCount: 0,
    category: 'Blank Canvas',
  },
];
