// Tipos para la aplicación Marketing & Sales Assistant

export interface Product {
  id: string;
  name: string;
  industry: string;
  problemSolved: string;
  features: string[];
  targetAudience: string;
  pricingModel: string;
  competitors: string;
  differentiators: string;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnalysis {
  valueProposition: string;
  painPointsSolved: string[];
  competitiveAdvantages: string[];
  marketPositioning: string;
  emotionalHooks: string[];
  uniqueSellingPoints: string[];
}

export interface BuyerPersona {
  id: string;
  name: string;
  role: string;
  demographics: {
    ageRange: string;
    companySize: string;
    location: string;
    experience: string;
  };
  psychographics: {
    motivations: string[];
    fears: string[];
    values: string[];
  };
  painPoints: string[];
  goals: string[];
  channels: string[];
  triggers: string[];
  objections: string[];
}

export interface SalesAngle {
  id: string;
  type: 'problem-solution' | 'roi' | 'emotional' | 'social-proof' | 'urgency' | 'competitive';
  title: string;
  headline: string;
  subheadline: string;
  keyPoints: string[];
  callToAction: string;
  bestFor: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  platform: Platform;
  title: string;
  content: string;
  hashtags?: string[];
  notes?: string;
  createdAt: string;
  scheduledFor?: string;
  status: 'draft' | 'ready' | 'published';
  imageData?: string;
}

export type ContentType = 
  | 'social-post'
  | 'email-sequence'
  | 'landing-copy'
  | 'video-script'
  | 'ad-copy'
  | 'blog-outline';

export type Platform = 
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'email'
  | 'landing'
  | 'google-ads'
  | 'blog';

export interface CalendarEvent {
  id: string;
  productId: string;
  contentId: string;
  title: string;
  description: string;
  date: string;
  platform: Platform;
  status: 'scheduled' | 'published' | 'draft';
}

export interface GeneratedImage {
  id: string;
  productId: string;
  prompt: string;
  base64: string;
  type: 'social' | 'ad' | 'mockup' | 'infographic';
  createdAt: string;
}

export interface AppState {
  currentProduct: Product | null;
  products: Product[];
  analysis: ProductAnalysis | null;
  personas: BuyerPersona[];
  salesAngles: SalesAngle[];
  content: ContentItem[];
  calendarEvents: CalendarEvent[];
  generatedImages: GeneratedImage[];
}

// Prompts predefinidos para diferentes tipos de contenido
export const CONTENT_PROMPTS = {
  socialPost: {
    linkedin: 'Profesional, enfocado en B2B, con insights de industria',
    twitter: 'Conciso, viral, con hooks potentes',
    instagram: 'Visual, lifestyle, con emojis y hashtags',
    tiktok: 'Trending, entretenido, con hook fuerte',
    facebook: 'Comunitario, engagement, conversacional'
  },
  emailSequence: {
    cold: 'Personalizado, valor-first, sin sales pitch agresivo',
    nurture: 'Educativo, construye confianza, casos de uso',
    sales: 'Beneficios claros, CTA fuerte, urgencia'
  }
};

// Ángulos de venta predefinidos
export const SALES_ANGLE_TYPES = [
  { id: 'problem-solution', label: 'Problema-Solución', icon: '🎯' },
  { id: 'roi', label: 'ROI y Ahorro', icon: '💰' },
  { id: 'emotional', label: 'Emocional', icon: '❤️' },
  { id: 'social-proof', label: 'Prueba Social', icon: '⭐' },
  { id: 'urgency', label: 'Urgencia', icon: '⏰' },
  { id: 'competitive', label: 'Ventaja Competitiva', icon: '🏆' }
];
