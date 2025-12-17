
import { MOCK_POSTS, MOCK_NOTIFICATIONS, MOCK_CATEGORIES, MOCK_MODULES, MOCK_TOOLS, MOCK_GIVEAWAYS, CURRENT_USER, MOCK_PROJECTS } from '../constants';
import { Post, Notification, CourseCategory, CourseModule, Tool, Giveaway, User, Project } from '../types';

export const mockBackend = {
  getPosts: async (): Promise<Post[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_POSTS]), 600);
    });
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost: Post = {
            id: Math.random().toString(36).substr(2, 9),
            likes: 0,
            comments: 0,
            createdAt: 'Agora',
            user: postData.user!,
            content: postData.content || '',
            type: postData.type || 'THOUGHT' as any,
            imageUrl: postData.imageUrl,
            codeSnippet: postData.codeSnippet
        };
        resolve(newPost);
      }, 500);
    });
  },

  getNotifications: async (): Promise<Notification[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 400));
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, 300));
  },

  getCourses: async (): Promise<CourseCategory[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CATEGORIES), 500));
  },

  getCourseModules: async (courseId: string): Promise<CourseModule[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple filter mock
        const modules = MOCK_MODULES.filter(m => m.courseId === courseId || m.courseId === 'cat1'); // Fallback for demo
        resolve(modules);
      }, 500);
    });
  },

  getTools: async (): Promise<Tool[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TOOLS), 400));
  },

  getGiveaways: async (): Promise<Giveaway[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_GIVEAWAYS), 400));
  },
  
  getUserProfile: async (): Promise<User> => {
      return new Promise((resolve) => setTimeout(() => resolve(CURRENT_USER), 300));
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const updated = { ...CURRENT_USER, ...updates, id: userId };
              resolve(updated);
          }, 500);
      });
  },

  getUserProjects: async (userId: string): Promise<Project[]> => {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PROJECTS), 400));
  },

  createProject: async (projectData: Partial<Project>): Promise<Project> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve({
                  id: Math.random().toString(36),
                  userId: 'current-user',
                  title: projectData.title || '',
                  description: projectData.description || '',
                  imageUrl: projectData.imageUrl || '',
                  tags: projectData.tags || [],
                  createdAt: 'Agora'
              });
          }, 500);
      });
  },

  deleteProject: async (projectId: string): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, 300));
  }
};
