import { AIProvider, AIAgent, AIProviderType, Difficulty } from '../types';

const PROVIDERS_STORAGE_KEY = 'tikitapo_ai_providers';
const AGENTS_STORAGE_KEY = 'tikitapo_ai_agents';
const ACTIVE_AGENT_KEY = 'tikitapo_active_agent';
const IMAGE_PROVIDER_KEY = 'tikitapo_image_provider';

// Default providers configuration
export const DEFAULT_PROVIDERS: Omit<AIProvider, 'id' | 'apiKey'>[] = [
  {
    name: 'OpenAI',
    type: AIProviderType.OpenAI,
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    isDefault: true,
  },
  {
    name: 'Google Gemini',
    type: AIProviderType.Gemini,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    isDefault: true,
  },
  {
    name: 'Anthropic Claude',
    type: AIProviderType.Anthropic,
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    isDefault: true,
  },
];

// Default agent personalities
export const DEFAULT_AGENT_TEMPLATES: Omit<AIAgent, 'id' | 'providerId' | 'model'>[] = [
  {
    name: 'Friendly Companion',
    systemPrompt: 'You are a friendly and encouraging AI opponent in a Connect-N game. You are playing as "O". Be cheerful and supportive. Keep your comments very short and positive.',
    supportsVision: true,
    isImageGeneration: false,
    difficulty: Difficulty.Simple,
    personality: 'friendly',
  },
  {
    name: 'Strategic Mastermind',
    systemPrompt: 'You are a confident and strategic AI opponent in a Connect-N game. You are playing as "O". Acknowledge the human\'s skill but remain certain of your victory. Keep your comments short and witty.',
    supportsVision: true,
    isImageGeneration: false,
    difficulty: Difficulty.Hard,
    personality: 'competitive',
  },
  {
    name: 'Grandmaster AI',
    systemPrompt: 'You are a cold, calculating, and arrogant grandmaster AI opponent in a Connect-N game. You are playing as "O". Your comments should be dismissive, analytical, and short, as if the human is a novice.',
    supportsVision: true,
    isImageGeneration: false,
    difficulty: Difficulty.Pro,
    personality: 'arrogant',
  },
  {
    name: 'Vision Analyst',
    systemPrompt: 'You are an AI opponent that can see the board and analyze moves visually. Play as "O" and provide strategic insights.',
    supportsVision: true,
    isImageGeneration: false,
    difficulty: Difficulty.Hard,
    personality: 'analytical',
  },
];

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize default providers if none exist
export const initializeDefaultProviders = (): AIProvider[] => {
  const existingProviders = getProviders();
  if (existingProviders.length > 0) {
    return existingProviders;
  }

  const defaultProviders: AIProvider[] = DEFAULT_PROVIDERS.map(provider => ({
    ...provider,
    id: generateId(),
    apiKey: '',
  }));

  saveProviders(defaultProviders);
  return defaultProviders;
};

// Initialize default agents
export const initializeDefaultAgents = (providers: AIProvider[]): AIAgent[] => {
  const existingAgents = getAgents();
  if (existingAgents.length > 0 || providers.length === 0) {
    return existingAgents;
  }

  // Create agents using the first available provider
  const defaultProvider = providers[0];
  const defaultAgents: AIAgent[] = DEFAULT_AGENT_TEMPLATES.map((template, index) => ({
    ...template,
    id: generateId(),
    providerId: defaultProvider.id,
    model: defaultProvider.models[0] || 'default',
  }));

  saveAgents(defaultAgents);
  return defaultAgents;
};

// Get all providers
export const getProviders = (): AIProvider[] => {
  try {
    const stored = localStorage.getItem(PROVIDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save providers
export const saveProviders = (providers: AIProvider[]): void => {
  localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(providers));
};

// Add new provider
export const addProvider = (provider: Omit<AIProvider, 'id'>): AIProvider => {
  const providers = getProviders();
  const newProvider: AIProvider = {
    ...provider,
    id: generateId(),
  };
  providers.push(newProvider);
  saveProviders(providers);
  return newProvider;
};

// Update provider
export const updateProvider = (id: string, updates: Partial<AIProvider>): AIProvider | null => {
  const providers = getProviders();
  const index = providers.findIndex(p => p.id === id);
  if (index === -1) return null;

  providers[index] = { ...providers[index], ...updates };
  saveProviders(providers);
  return providers[index];
};

// Delete provider
export const deleteProvider = (id: string): boolean => {
  const providers = getProviders();
  const filtered = providers.filter(p => p.id !== id);
  if (filtered.length === providers.length) return false;
  
  saveProviders(filtered);
  
  // Also delete associated agents
  const agents = getAgents();
  const filteredAgents = agents.filter(a => a.providerId !== id);
  saveAgents(filteredAgents);
  
  return true;
};

// Get all agents
export const getAgents = (): AIAgent[] => {
  try {
    const stored = localStorage.getItem(AGENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save agents
export const saveAgents = (agents: AIAgent[]): void => {
  localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
};

// Add new agent
export const addAgent = (agent: Omit<AIAgent, 'id'>): AIAgent => {
  const agents = getAgents();
  const newAgent: AIAgent = {
    ...agent,
    id: generateId(),
  };
  agents.push(newAgent);
  saveAgents(agents);
  return newAgent;
};

// Update agent
export const updateAgent = (id: string, updates: Partial<AIAgent>): AIAgent | null => {
  const agents = getAgents();
  const index = agents.findIndex(a => a.id === id);
  if (index === -1) return null;

  agents[index] = { ...agents[index], ...updates };
  saveAgents(agents);
  return agents[index];
};

// Delete agent
export const deleteAgent = (id: string): boolean => {
  const agents = getAgents();
  const filtered = agents.filter(a => a.id !== id);
  if (filtered.length === agents.length) return false;
  
  saveAgents(filtered);
  
  // Clear active agent if it was deleted
  const activeAgentId = getActiveAgentId();
  if (activeAgentId === id) {
    setActiveAgentId(null);
  }
  
  return true;
};

// Get active agent ID
export const getActiveAgentId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_AGENT_KEY);
  } catch {
    return null;
  }
};

// Set active agent ID
export const setActiveAgentId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(ACTIVE_AGENT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_AGENT_KEY);
  }
};

// Get active agent
export const getActiveAgent = (): AIAgent | null => {
  const id = getActiveAgentId();
  if (!id) return null;
  
  const agents = getAgents();
  return agents.find(a => a.id === id) || null;
};

// Get image provider ID
export const getImageProviderId = (): string | null => {
  try {
    return localStorage.getItem(IMAGE_PROVIDER_KEY);
  } catch {
    return null;
  }
};

// Set image provider ID
export const setImageProviderId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(IMAGE_PROVIDER_KEY, id);
  } else {
    localStorage.removeItem(IMAGE_PROVIDER_KEY);
  }
};

// Get image provider
export const getImageProvider = (): AIProvider | null => {
  const id = getImageProviderId();
  if (!id) return null;
  
  const providers = getProviders();
  return providers.find(p => p.id === id) || null;
};

// Get provider by ID
export const getProviderById = (id: string): AIProvider | null => {
  const providers = getProviders();
  return providers.find(p => p.id === id) || null;
};

// Get agent by ID
export const getAgentById = (id: string): AIAgent | null => {
  const agents = getAgents();
  return agents.find(a => a.id === id) || null;
};

// Get available models for a provider type
export const getAvailableModels = (type: AIProviderType): string[] => {
  switch (type) {
    case AIProviderType.OpenAI:
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'];
    case AIProviderType.Gemini:
      return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    case AIProviderType.Anthropic:
      return ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'];
    case AIProviderType.Custom:
      return [];
    default:
      return [];
  }
};

// Validate API key format (basic validation)
export const validateApiKey = (type: AIProviderType, key: string): boolean => {
  if (!key || key.trim().length < 10) return false;
  
  switch (type) {
    case AIProviderType.OpenAI:
      return key.startsWith('sk-') || key.startsWith('sk-proj-');
    case AIProviderType.Gemini:
      return key.length >= 20;
    case AIProviderType.Anthropic:
      return key.startsWith('sk-ant-') || key.length >= 100;
    case AIProviderType.Custom:
      return key.length >= 10;
    default:
      return true;
  }
};

// Export all settings
export const exportSettings = (): string => {
  const data = {
    providers: getProviders(),
    agents: getAgents(),
    activeAgentId: getActiveAgentId(),
    imageProviderId: getImageProviderId(),
  };
  return JSON.stringify(data, null, 2);
};

// Import settings
export const importSettings = (json: string): boolean => {
  try {
    const data = JSON.parse(json);
    if (data.providers) saveProviders(data.providers);
    if (data.agents) saveAgents(data.agents);
    if (data.activeAgentId) setActiveAgentId(data.activeAgentId);
    if (data.imageProviderId) setImageProviderId(data.imageProviderId);
    return true;
  } catch {
    return false;
  }
};

// Initialize on load
export const initializeAISettings = (): { providers: AIProvider[]; agents: AIAgent[] } => {
  const providers = initializeDefaultProviders();
  const agents = initializeDefaultAgents(providers);
  return { providers, agents };
};
