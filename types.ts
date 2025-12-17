
export enum PostType {
  THOUGHT = 'THOUGHT',
  QUESTION = 'QUESTION',
  SHOWCASE = 'SHOWCASE'
}

export enum UserPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string;
  handle?: string;
  bio?: string;
  plan?: UserPlan;
  coverUrl?: string;
  followers?: number;
  following?: number;
  isPublicProfile?: boolean;
  isAdmin?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeSubs: number;
  totalPosts: number;
}

export interface AppConfig {
  registrationOpen: boolean;
  maxUsers: number;
}

export interface PostTag {
  type: 'tool' | 'course' | 'topic' | 'level';
  value: string;
  icon?: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  type: PostType;
  likes: number;
  comments: number;
  imageUrl?: string;
  codeSnippet?: string;
  // Phase 1: Tags and Q&A
  tags?: PostTag[];
  isResolved?: boolean;
  acceptedAnswerId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // ID do comentário pai (null para comentários de nível superior)
  user: User;
  content: string;
  createdAt: string;
  replies?: Comment[]; // Respostas aninhadas (para renderização)
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  user?: User;
  message: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

// --- NEW COURSE HIERARCHY ---

// Nível 1: Categoria (Ex: Desenvolvimento Web, IA, Design)
export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  isPremium: boolean;
  tags: string[];
}

// Nível 2: Curso (Ex: "Dominando o Lovable", "React Avançado")
export interface Course {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName?: string;
  duration?: string;
  level?: string;
  modulesCount?: number; // Para UI
}

// Nível 3: Módulo (Ex: "Fundamentos", "Integrando API")
export interface CourseModule {
  id: string;
  courseId: string; // Mudou de categoryId para courseId
  title: string;
  description: string;
  lessons: CourseLesson[];
}

// Nível 4: Aula
export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content: string;
  completed: boolean;
  rating?: number;
}

// --- PORTFOLIO PROJECT ---
export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  tags: string[];
  createdAt: string;
}

// --- Tool Types ---
export interface UseCase {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string; // 'month', 'year', 'one-time', 'free'
  features: string[];
  isPopular?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  logoUrl: string;
  category: string;
  rating: number;
  websiteUrl: string;
  isPremium: boolean;
  features: string[];
  relatedVideoUrl?: string;

  // Expanded fields
  whatIs?: string; // Descrição expandida sobre o que é a ferramenta
  howToUse?: string; // Guia de como usar
  useCases?: UseCase[]; // Casos de uso práticos
  faq?: FAQ[]; // Perguntas frequentes
  reviews?: Review[]; // Avaliações da comunidade
  pricing?: PricingPlan[]; // Planos e preços
  relatedToolIds?: string[]; // IDs de ferramentas relacionadas
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  endDate: string;
  participants: number;
  requiredPlan: UserPlan;
  status: 'OPEN' | 'CLOSED' | 'FUTURE';
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  thumbnailUrl: string;
  streamUrl: string;
  isLiveNow: boolean;
  requiredPlan: UserPlan;
}

// --- SUGGESTIONS SYSTEM ---
export type SuggestionCategory = 'course' | 'feature' | 'content' | 'tool' | 'other';
export type SuggestionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented';

export interface Suggestion {
  id: string;
  user: User;
  title: string;
  description: string;
  category: SuggestionCategory;
  status: SuggestionStatus;
  votesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  userVote?: 'up' | 'down' | null; // Voto do usuário atual
}

export interface SuggestionComment {
  id: string;
  suggestionId: string;
  user: User;
  content: string;
  parentId?: string;
  replies?: SuggestionComment[];
  createdAt: string;
}
