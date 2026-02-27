import React, { useState, useEffect } from 'react';
import { AIProvider, AIAgent, AIProviderType, Difficulty } from '../types';
import * as aiProviderService from '../services/aiProviderService';

// Inline SVG Icons
const IconX: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconPlus: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconTrash: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconEdit: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconCheck: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconAlert: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconEye: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconEyeOff: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const IconBot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect IconX="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const IconKey: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
  </svg>
);

const IconImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect IconX="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'providers' | 'agents' | 'active';

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [imageProviderId, setImageProviderId] = useState<string | null>(null);

  // Form states
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // New provider form
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: AIProviderType.OpenAI,
    apiKey: '',
    baseUrl: '',
    models: [] as string[],
  });

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: '',
    providerId: '',
    model: '',
    systemPrompt: '',
    supportsVision: false,
    isImageGeneration: false,
    difficulty: Difficulty.Simple,
    personality: 'friendly' as const,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const loadedProviders = aiProviderService.getProviders();
    const loadedAgents = aiProviderService.getAgents();
    
    // Initialize defaults if empty
    if (loadedProviders.length === 0) {
      const { providers: defaultProviders, agents: defaultAgents } = aiProviderService.initializeAISettings();
      setProviders(defaultProviders);
      setAgents(defaultAgents);
    } else {
      setProviders(loadedProviders);
      setAgents(loadedAgents);
    }
    
    setActiveAgentId(aiProviderService.getActiveAgentId());
    setImageProviderId(aiProviderService.getImageProviderId());
  };

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.apiKey) return;

    const provider = aiProviderService.addProvider({
      ...newProvider,
      baseUrl: newProvider.baseUrl || undefined,
      isDefault: false,
    });

    setProviders([...providers, provider]);
    setIsAddingProvider(false);
    setNewProvider({
      name: '',
      type: AIProviderType.OpenAI,
      apiKey: '',
      baseUrl: '',
      models: [],
    });
  };

  const handleUpdateProvider = () => {
    if (!editingProvider) return;

    const updated = aiProviderService.updateProvider(editingProvider.id, editingProvider);
    if (updated) {
      setProviders(providers.map(p => p.id === updated.id ? updated : p));
      setEditingProvider(null);
    }
  };

  const handleDeleteProvider = (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider? All associated agents will also be deleted.')) {
      aiProviderService.deleteProvider(id);
      setProviders(providers.filter(p => p.id !== id));
      setAgents(agents.filter(a => a.providerId !== id));
    }
  };

  const handleAddAgent = () => {
    if (!newAgent.name || !newAgent.providerId || !newAgent.model) return;

    const agent = aiProviderService.addAgent(newAgent);
    setAgents([...agents, agent]);
    setIsAddingAgent(false);
    setNewAgent({
      name: '',
      providerId: '',
      model: '',
      systemPrompt: '',
      supportsVision: false,
      isImageGeneration: false,
      difficulty: Difficulty.Simple,
      personality: 'friendly',
    });
  };

  const handleUpdateAgent = () => {
    if (!editingAgent) return;

    const updated = aiProviderService.updateAgent(editingAgent.id, editingAgent);
    if (updated) {
      setAgents(agents.map(a => a.id === updated.id ? updated : a));
      setEditingAgent(null);
    }
  };

  const handleDeleteAgent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      aiProviderService.deleteAgent(id);
      setAgents(agents.filter(a => a.id !== id));
      if (activeAgentId === id) {
        setActiveAgentId(null);
        aiProviderService.setActiveAgentId(null);
      }
    }
  };

  const handleSetActiveAgent = (agentId: string) => {
    aiProviderService.setActiveAgentId(agentId);
    setActiveAgentId(agentId);
  };

  const handleSetImageProvider = (providerId: string) => {
    aiProviderService.setImageProviderId(providerId);
    setImageProviderId(providerId);
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getAvailableModels = (type: AIProviderType) => {
    return aiProviderService.getAvailableModels(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBot className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">AI Settings</h2>
              <p className="text-white/70 text-sm">Configure your AI providers and agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <IconX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'providers', label: 'API Keys', icon: IconKey },
            { id: 'agents', label: 'AI Agents', icon: IconBot },
            { id: 'active', label: 'Active Selection', icon: IconCheck },
          ].map((tab) => (
            <button
              IconKey={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">API Providers</h3>
                <button
                  onClick={() => setIsAddingProvider(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                  Add Provider
                </button>
              </div>

              {isAddingProvider && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                        placeholder="e.g., My OpenAI"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Provider Type</label>
                      <select
                        value={newProvider.type}
                        onChange={(e) => {
                          const type = e.target.value as AIProviderType;
                          setNewProvider({
                            ...newProvider,
                            type,
                            models: getAvailableModels(type),
                          });
                        }}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        {Object.values(AIProviderType).map((type) => (
                          <option IconKey={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">API IconKey</label>
                    <input
                      type="password"
                      value={newProvider.apiKey}
                      onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                      placeholder="Enter your API IconKey"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your API IconKey is stored locally in your browser.
                    </p>
                  </div>

                  {newProvider.type === AIProviderType.Custom && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Base URL (Optional)</label>
                      <input
                        type="text"
                        value={newProvider.baseUrl}
                        onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                        placeholder="https://api.example.com/v1"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingProvider(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProvider}
                      disabled={!newProvider.name || !newProvider.apiKey}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                    >
                      Add Provider
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {providers.map((provider) => (
                  <div IconKey={provider.id} className="bg-gray-800 rounded-lg p-4">
                    {editingProvider?.id === provider.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingProvider.name}
                            onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                            className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type={showApiKey[provider.id] ? 'text' : 'password'}
                              value={editingProvider.apiKey}
                              onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                              placeholder="API IconKey"
                              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                            <button
                              onClick={() => toggleApiKeyVisibility(provider.id)}
                              className="p-2 text-gray-400 hover:text-white"
                            >
                              {showApiKey[provider.id] ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingProvider(null)}
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateProvider}
                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${provider.apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-medium text-white">{provider.name}</div>
                            <div className="text-sm text-gray-400">
                              {provider.type} • {provider.models.length} models
                              {provider.isDefault && <span className="ml-2 text-purple-400">(Default)</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProvider(provider);
                              setShowApiKey({ ...showApiKey, [provider.id]: false });
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {providers.length === 0 && !isAddingProvider && (
                  <div className="text-center py-8 text-gray-500">
                    <IconAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No providers configured yet.</p>
                    <p className="text-sm">Add an API provider to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">AI Agents</h3>
                <button
                  onClick={() => setIsAddingAgent(true)}
                  disabled={providers.filter(p => p.apiKey).length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                  Add Agent
                </button>
              </div>

              {providers.filter(p => p.apiKey).length === 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-200">
                  <div className="flex items-center gap-2">
                    <IconAlert className="w-5 h-5" />
                    <span>Please configure an API provider with a valid API IconKey first.</span>
                  </div>
                </div>
              )}

              {isAddingAgent && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Agent Name</label>
                      <input
                        type="text"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        placeholder="e.g., Strategic AI"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Provider</label>
                      <select
                        value={newAgent.providerId}
                        onChange={(e) => {
                          const providerId = e.target.value;
                          const provider = providers.find(p => p.id === providerId);
                          setNewAgent({
                            ...newAgent,
                            providerId,
                            model: provider?.models[0] || '',
                          });
                        }}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Select a provider...</option>
                        {providers
                          .filter(p => p.apiKey)
                          .map((provider) => (
                            <option IconKey={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                      <select
                        value={newAgent.model}
                        onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                        disabled={!newAgent.providerId}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                      >
                        <option value="">Select a model...</option>
                        {newAgent.providerId &&
                          providers
                            .find((p) => p.id === newAgent.providerId)
                            ?.models.map((model) => (
                              <option IconKey={model} value={model}>
                                {model}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                      <select
                        value={newAgent.difficulty}
                        onChange={(e) => setNewAgent({ ...newAgent, difficulty: e.target.value as Difficulty })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        {Object.values(Difficulty).map((diff) => (
                          <option IconKey={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">System Prompt</label>
                    <textarea
                      value={newAgent.systemPrompt}
                      onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                      placeholder="You are an AI opponent in a Connect-N game..."
                      rows={3}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAgent.supportsVision}
                        onChange={(e) => setNewAgent({ ...newAgent, supportsVision: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600"
                      />
                      <span className="text-sm text-gray-300">Supports Vision</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAgent.isImageGeneration}
                        onChange={(e) => setNewAgent({ ...newAgent, isImageGeneration: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600"
                      />
                      <span className="text-sm text-gray-300">Image Generation</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingAgent(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAgent}
                      disabled={!newAgent.name || !newAgent.providerId || !newAgent.model}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                    >
                      Add Agent
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {agents
                  .filter((agent) => !agent.isImageGeneration)
                  .map((agent) => (
                    <div IconKey={agent.id} className="bg-gray-800 rounded-lg p-4">
                      {editingAgent?.id === agent.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editingAgent.name}
                              onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                              className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                            <select
                              value={editingAgent.difficulty}
                              onChange={(e) => setEditingAgent({ ...editingAgent, difficulty: e.target.value as Difficulty })}
                              className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                              {Object.values(Difficulty).map((diff) => (
                                <option IconKey={diff} value={diff}>{diff}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={editingAgent.systemPrompt}
                            onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                            rows={2}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingAgent(null)}
                              className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateAgent}
                              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded text-white"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IconBot className="w-5 h-5 text-purple-400" />
                              <span className="font-medium text-white">{agent.name}</span>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                agent.difficulty === Difficulty.Simple
                                  ? 'bg-green-500/20 text-green-400'
                                  : agent.difficulty === Difficulty.Hard
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {agent.difficulty}
                              </span>
                              {agent.supportsVision && (
                                <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
                                  Vision
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {providers.find((p) => p.id === agent.providerId)?.name} • {agent.model}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingAgent(agent)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {agents.filter((a) => !a.isImageGeneration).length === 0 && !isAddingAgent && (
                  <div className="text-center py-8 text-gray-500">
                    <IconBot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No AI agents configured yet.</p>
                    <p className="text-sm">Add an agent to play against.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Selection Tab */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Active AI Agent</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Select which AI agent to use when playing against AI.
                </p>

                <div className="space-y-2">
                  {agents
                    .filter((agent) => !agent.isImageGeneration)
                    .map((agent) => {
                      const provider = providers.find((p) => p.id === agent.providerId);
                      const isActive = activeAgentId === agent.id;
                      const hasApiKey = !!provider?.apiKey;

                      return (
                        <button
                          IconKey={agent.id}
                          onClick={() => hasApiKey && handleSetActiveAgent(agent.id)}
                          disabled={!hasApiKey}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            isActive
                              ? 'border-purple-500 bg-purple-500/20'
                              : hasApiKey
                              ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                              : 'border-gray-800 bg-gray-800/50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isActive ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                                }`}
                              >
                                {isActive && <IconCheck className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="font-medium text-white">{agent.name}</div>
                                <div className="text-sm text-gray-400">
                                  {provider?.name} • {agent.model} • {agent.difficulty}
                                </div>
                              </div>
                            </div>
                            {!hasApiKey && (
                              <span className="text-xs text-red-400">No API IconKey</span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                  {agents.filter((a) => !a.isImageGeneration).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No agents available.</p>
                      <button
                        onClick={() => setActiveTab('agents')}
                        className="mt-2 text-purple-400 hover:text-purple-300"
                      >
                        Create an agent first →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Image Generation Provider</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Select which provider to use for generating victory images and avatars.
                </p>

                <div className="space-y-2">
                  {providers
                    .filter((p) => p.apiKey && p.type === AIProviderType.Gemini)
                    .map((provider) => {
                      const isActive = imageProviderId === provider.id;

                      return (
                        <button
                          IconKey={provider.id}
                          onClick={() => handleSetImageProvider(provider.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            isActive
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isActive ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                              }`}
                            >
                              {isActive && <IconCheck className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-medium text-white">{provider.name}</div>
                              <div className="text-sm text-gray-400">
                                {provider.type} • {provider.models[0]}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                  {providers.filter((p) => p.apiKey && p.type === AIProviderType.Gemini).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <IconImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No image generation providers configured.</p>
                      <p className="text-sm mt-2">
                        Add a Google Gemini provider with a valid API IconKey.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
