import { AIProvider, AIAgent, AIProviderType, Board, Difficulty, CellState, Move, Profile } from '../types';
import * as aiProviderService from './aiProviderService';

// Unified AI Service that works with multiple providers
export class UnifiedAIService {
  private provider: AIProvider | null = null;
  private agent: AIAgent | null = null;

  constructor(provider?: AIProvider, agent?: AIAgent) {
    this.provider = provider || null;
    this.agent = agent || null;
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  setAgent(agent: AIAgent) {
    this.agent = agent;
  }

  // Check if service is ready to make calls
  isReady(): boolean {
    return !!this.provider?.apiKey && !!this.agent;
  }

  // Format board for AI prompt
  private formatBoard(board: Board): string {
    return board.map(row => 
      row.map(cell => {
        switch(cell) {
          case CellState.X: return 'X';
          case CellState.O: return 'O';
          case CellState.Obstacle: return '#';
          default: return '.';
        }
      }).join(' ')
    ).join('\n');
  }

  // Make API call based on provider type
  private async makeAPICall(messages: any[], isVision: boolean = false): Promise<string> {
    if (!this.provider || !this.provider.apiKey) {
      throw new Error('No API key configured');
    }

    const model = this.agent?.model || this.provider.models[0];

    switch (this.provider.type) {
      case AIProviderType.OpenAI:
        return this.callOpenAI(messages, model);
      case AIProviderType.Gemini:
        return this.callGemini(messages, model);
      case AIProviderType.Anthropic:
        return this.callAnthropic(messages, model);
      case AIProviderType.Custom:
        return this.callCustom(messages, model);
      default:
        throw new Error('Unsupported provider type');
    }
  }

  // OpenAI API call
  private async callOpenAI(messages: any[], model: string): Promise<string> {
    const baseUrl = this.provider?.baseUrl || 'https://api.openai.com/v1';
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider?.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Gemini API call
  private async callGemini(messages: any[], model: string): Promise<string> {
    const baseUrl = this.provider?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    
    // Convert OpenAI-style messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `${baseUrl}/models/${model}:generateContent?key=${this.provider?.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Anthropic API call
  private async callAnthropic(messages: any[], model: string): Promise<string> {
    const baseUrl = this.provider?.baseUrl || 'https://api.anthropic.com/v1';
    
    // Extract system message if present
    let systemMessage = '';
    const userMessages = messages.filter((msg: any) => {
      if (msg.role === 'system') {
        systemMessage = msg.content;
        return false;
      }
      return true;
    });

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.provider?.apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 150,
        system: systemMessage,
        messages: userMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  // Custom/OpenAI-compatible API call
  private async callCustom(messages: any[], model: string): Promise<string> {
    const baseUrl = this.provider?.baseUrl;
    if (!baseUrl) {
      throw new Error('Custom provider requires a base URL');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider?.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Generate AI comment during gameplay
  async getAIComment(board: Board, difficulty: Difficulty, lastMove: Move): Promise<string> {
    if (!this.isReady()) {
      return '...';
    }

    const systemPrompt = this.agent?.systemPrompt || 'You are an AI opponent in a Connect-N game.';
    const boardString = this.formatBoard(board);

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `The current board state is:\n${boardString}\n\nI (O) just made a move at row ${lastMove.row}, column ${lastMove.col}. What is a short, in-character comment I can say to the human player (X)? Respond with only the comment, without quotes, and in 15 words or less.`,
      },
    ];

    try {
      const response = await this.makeAPICall(messages);
      return response.trim().replace(/"/g, '');
    } catch (error) {
      console.error('Error generating AI comment:', error);
      return 'Hmm...';
    }
  }

  // Generate victory image
  async generateVictoryImage(profile: Profile, avatarUrl?: string): Promise<string> {
    // For now, fall back to Gemini service if using Gemini
    if (this.provider?.type === AIProviderType.Gemini) {
      // Import and use existing Gemini service
      const { generateVictoryImage } = await import('./geminiService');
      return generateVictoryImage(profile, avatarUrl);
    }

    // For other providers, we'll need to implement image generation
    // For now, throw an error or return a placeholder
    throw new Error(`Image generation not yet implemented for ${this.provider?.type}`);
  }

  // Generate avatar
  async generateAvatar(prompt: string): Promise<string> {
    if (this.provider?.type === AIProviderType.Gemini) {
      const { generateAvatar } = await import('./geminiService');
      return generateAvatar(prompt);
    }

    throw new Error(`Avatar generation not yet implemented for ${this.provider?.type}`);
  }
}

// Create service instance with active agent
export const createActiveAIService = (): UnifiedAIService => {
  const agent = aiProviderService.getActiveAgent();
  if (!agent) {
    return new UnifiedAIService();
  }

  const provider = aiProviderService.getProviderById(agent.providerId);
  if (!provider) {
    return new UnifiedAIService();
  }

  return new UnifiedAIService(provider, agent);
};

// Check if any AI agent is configured and ready
export const isAIConfigured = (): boolean => {
  const agent = aiProviderService.getActiveAgent();
  if (!agent) return false;

  const provider = aiProviderService.getProviderById(agent.providerId);
  return !!provider?.apiKey;
};

// Get available agents for a difficulty
export const getAgentsForDifficulty = (difficulty: Difficulty): AIAgent[] => {
  const agents = aiProviderService.getAgents();
  return agents.filter(agent => agent.difficulty === difficulty && !agent.isImageGeneration);
};

// Get available image generation providers
export const getImageProviders = (): AIProvider[] => {
  const providers = aiProviderService.getProviders();
  const agents = aiProviderService.getAgents();
  
  // Find providers that have image generation agents
  const imageAgentProviderIds = agents
    .filter(agent => agent.isImageGeneration)
    .map(agent => agent.providerId);

  return providers.filter(p => 
    p.apiKey && (imageAgentProviderIds.includes(p.id) || p.type === AIProviderType.Gemini)
  );
};
