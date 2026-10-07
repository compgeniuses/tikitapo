import { GoogleGenAI, Modality } from '@google/genai';
import { Profile } from '../types';
import { AIProviderType } from '../types';
import * as aiProviderService from './aiProviderService';

// Image generation uses Nano Banana 2 (Gemini 3.1 Flash Image). Gameplay decisions live in
// jevService/aiEngine; Gemini is only used for pictures.
export const IMAGE_MODEL = 'gemini-3.1-flash-image';

// Created lazily so a missing key never breaks app start-up.
let client: GoogleGenAI | null = null;
let clientKey = '';

const getClient = (): GoogleGenAI => {
  const apiKey = aiProviderService.getApiKeyForType(AIProviderType.Gemini);
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Add one in AI Settings or set VITE_GEMINI_API_KEY.');
  }
  if (!client || clientKey !== apiKey) {
    client = new GoogleGenAI({ apiKey });
    clientKey = apiKey;
  }
  return client;
};

const getPromptForProfile = (profile: Profile): string => {
  switch (profile) {
    case Profile.Man:
      return 'An artistic portrait of a beautiful and powerful female fantasy sorceress, celebrating a great victory. She is depicted in elegant, tasteful, non-revealing robes with a magical aura. The style is high-quality digital art, with cinematic lighting and intricate details, emphasizing beauty and power. SFW.';
    case Profile.Woman:
      return 'An artistic portrait of a handsome and heroic male warrior with a strong physique, depicted in ornate, family-friendly armor after a great victory. The style is high-quality digital art, with Rembrandt lighting and intricate details, emphasizing beauty and strength. SFW.';
    case Profile.Child:
      return 'A curious child discovering a glowing, magical forest, storybook illustration style, vibrant colors, whimsical, sense of wonder, detailed fantasy landscape. SFW.';
    default:
      return 'A beautiful, award-winning photograph of a celebratory landscape after a great victory.';
  }
};

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

const generateImage = async (parts: Part[]): Promise<string> => {
  const response = await getClient().models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: 'user', parts }],
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('The image model did not return an image.');
};

export const generateVictoryImage = async (profile: Profile, playerAvatarUrl?: string): Promise<string> => {
  // Edit the player's avatar into a victory scene when we have one, otherwise draw from the profile prompt.
  const match = playerAvatarUrl?.match(/^data:(image\/.*?);base64,(.*)$/);
  if (match) {
    try {
      return await generateImage([
        { inlineData: { mimeType: match[1], data: match[2] } },
        {
          text: 'Make this character look like a triumphant, heroic warrior celebrating a great victory. Add epic, cinematic lighting and a dynamic, celebratory background. Ensure the character is family-friendly. SFW.',
        },
      ]);
    } catch (error) {
      console.error('Avatar-based victory image failed, falling back to profile prompt:', error);
    }
  }
  return generateImage([{ text: getPromptForProfile(profile) }]);
};

export const generateAvatar = async (prompt: string): Promise<string> =>
  generateImage([
    {
      text: `Create a unique, SFW, portrait-style avatar based on the following description: "${prompt}". The style should be vibrant digital art, suitable for a profile picture. No text, no words.`,
    },
  ]);
