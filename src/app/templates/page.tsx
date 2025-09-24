'use client';

import {
  Plus,
  Sparkles,
  Copy,
  Globe,
  Lock,
  TrendingUp,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useState } from 'react';
import { Id } from '../../../convex/_generated/dataModel';

export default function TemplatesPage() {
  const { user } = useUser();
  const isSignedIn = !!user;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'public'>('all');

  // Fetch templates
  const myTemplates = useQuery(api.templates.getMyTemplates) || [];
  const publicTemplates = useQuery(api.templates.getPublicTemplates, { limit: 50 }) || [];
  const createTemplateMutation = useMutation(api.templates.createTemplate);
  const duplicateTemplateMutation = useMutation(api.templates.duplicateTemplate);

  // Combine and filter templates based on filter type
  const allTemplates = filterType === 'mine'
    ? myTemplates
    : filterType === 'public'
    ? publicTemplates.filter(t => t.profileId !== myTemplates[0]?.profileId)
    : [...myTemplates, ...publicTemplates.filter(t => !myTemplates.find(mt => mt._id === t._id))];

  // Type helper to check if template has profile
  const hasProfile = (template: typeof allTemplates[0]): template is typeof publicTemplates[0] => {
    return 'profile' in template;
  };

  // Apply search filter
  const filteredTemplates = allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return;

    setCreating(true);
    try {
      await createTemplateMutation({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        isPublic
      });

      setShowCreateDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      setIsPublic(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicateTemplate = async (templateId: Id<"templates">, originalName: string) => {
    try {
      await duplicateTemplateMutation({
        templateId,
        newName: `${originalName} (Copy)`
      });
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Screenshot Templates</h1>
            <p className="text-muted-foreground">
              Create reusable templates for consistent screenshot generation
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted/50 border'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('mine')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'mine'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted/50 border'
              }`}
            >
              My Templates
            </button>
            <button
              onClick={() => setFilterType('public')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'public'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted/50 border'
              }`}
            >
              Public
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sign in prompt */}
      {!isSignedIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8 bg-card/50 rounded-xl mt-8"
        >
          <p className="text-muted-foreground">Sign in to create and manage your own templates</p>
        </motion.div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No templates found' : 'No templates yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first template to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Create Your First Template
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className="rounded-xl border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Template Preview Area */}
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5 p-4 flex items-center justify-center relative">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                  </div>

                  {/* Template Icon */}
                  <div className="relative z-10">
                    <Sparkles className="w-12 h-12 text-primary/60" />
                  </div>

                  {/* Ownership Badge */}
                  <div className="absolute top-3 right-3">
                    {template.isPublic ? (
                      <div className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Template Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{template.usageCount || 0} uses</span>
                    </div>
                    {hasProfile(template) && template.profile && (
                      <span className="truncate">by {template.profile.username || 'Anonymous'}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {template.profileId === myTemplates[0]?.profileId ? (
                      <button className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm transition-colors">
                        Edit Template
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDuplicateTemplate(template._id, template.name)}
                        className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Use Template
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowCreateDialog(false);
                setTemplateName('');
                setTemplateDescription('');
                setIsPublic(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-md mx-4"
            >
              {/* Dialog Header */}
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create New Template</h2>
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setTemplateName('');
                    setTemplateDescription('');
                    setIsPublic(false);
                  }}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="p-6 space-y-4">
                {/* Template Name */}
                <div>
                  <label htmlFor="template-name" className="text-sm font-medium mb-1.5 block">
                    Template Name
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., App Store Hero Screenshots"
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    autoFocus
                  />
                </div>

                {/* Template Description */}
                <div>
                  <label htmlFor="template-description" className="text-sm font-medium mb-1.5 block">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe what this template is for..."
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[80px] resize-none"
                  />
                </div>

                {/* Public/Private Toggle */}
                <div>
                  <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      {isPublic ? <Globe className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <p className="font-medium text-sm">Make Public</p>
                        <p className="text-xs text-muted-foreground">
                          {isPublic ? 'Others can use this template' : 'Only you can use this template'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isPublic ? 'bg-green-600' : 'bg-muted'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="border-t px-6 py-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setTemplateName('');
                    setTemplateDescription('');
                    setIsPublic(false);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={!templateName.trim() || creating}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {creating && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-200, 200] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="relative">
                    {creating ? 'Creating...' : 'Create Template'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}