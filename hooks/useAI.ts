import { useCallback } from 'react';
import { Board, Difficulty, Move, Profile, AIProvider, AIAgent } from '../types';
import * as geminiService from '../services/geminiService';
import * as unifiedAIService from '../services/unifiedAIService';
import * as aiProviderService from '../services/aiProviderService';

interface UseAIProps {
  onAIComment?: (comment: string) => void;
}

export const useAI = (_props?: UseAIProps) => {
  const getAIComment = useCallback(
    async (board: Board, difficulty: Difficulty, lastMove: Move): Promise<string> => {
      try {
        const aiService = unifiedAIService.createActiveAIService();

        if (aiService.isReady()) {
          return await aiService.getAIComment(board, difficulty, lastMove);
        }

        // Fallback to Gemini
        return await geminiService.getAIPersonalityComment(board, difficulty, lastMove);
      } catch (error) {
        console.error('Failed to get AI comment:', error);
        return 'Hmm...';
      }
    },
    []
  );

  const generateVictoryImage = useCallback(
    async (profile: Profile, avatarUrl?: string): Promise<string> => {
      try {
        const imageProvider = aiProviderService.getImageProvider();

        if (imageProvider) {
          const aiService = new unifiedAIService.UnifiedAIService(imageProvider);
          return await aiService.generateVictoryImage(profile, avatarUrl);
        }

        // Fallback to Gemini
        return await geminiService.generateVictoryImage(profile, avatarUrl);
      } catch (error) {
        console.error('Failed to generate victory image:', error);
        throw error;
      }
    },
    []
  );

  const generateAvatar = useCallback(async (prompt: string): Promise<string> => {
    try {
      const imageProvider = aiProviderService.getImageProvider();

      if (imageProvider) {
        const aiService = new unifiedAIService.UnifiedAIService(imageProvider);
        return await aiService.generateAvatar(prompt);
      }

      // Fallback to Gemini
      return await geminiService.generateAvatar(prompt);
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      throw error;
    }
  }, []);

  const getActiveAgent = useCallback((): AIAgent | null => {
    return aiProviderService.getActiveAgent();
  }, []);

  const getActiveProvider = useCallback((): AIProvider | null => {
    const agent = aiProviderService.getActiveAgent();
    if (!agent) return null;
    return aiProviderService.getProviderById(agent.providerId);
  }, []);

  const isAIReady = useCallback((): boolean => {
    const agent = aiProviderService.getActiveAgent();
    if (!agent) return false;
    const provider = aiProviderService.getProviderById(agent.providerId);
    return !!provider?.apiKey;
  }, []);

  return {
    getAIComment,
    generateVictoryImage,
    generateAvatar,
    getActiveAgent,
    getActiveProvider,
    isAIReady,
  };
};
