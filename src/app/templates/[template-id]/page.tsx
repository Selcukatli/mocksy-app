'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Globe,
  Lock,
  Sparkles,
  Trash2,
  Code,
  X,
  Check,
  Image as ImageIcon,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params['template-id'] as Id<'templates'>;

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [activeTab, setActiveTab] = useState<'variants' | 'screenshots'>('variants');

  // Fetch template data
  const template = useQuery(api.templates.getTemplate, { templateId });
  const templateVariants = useQuery(api.templateVariants.getTemplateVariants, { templateId });
  const templateScreenshots = useQuery(api.templateScreenshots.getTemplateScreenshots, {
    templateId,
    limit: 20
  });
  const currentProfile = useQuery(api.features.profiles.queries.getCurrentProfile);

  // Mutations
  const updateTemplate = useMutation(api.templates.updateTemplate);
  const deleteTemplate = useMutation(api.templates.deleteTemplate);
  const setActiveVariant = useMutation(api.templateVariants.setActiveVariant);
  const deleteVariant = useMutation(api.templateVariants.deleteVariant);

  // Check ownership
  const isOwner = !!(currentProfile && template && template.profileId === currentProfile._id);

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  const handleUpdateName = async () => {
    if (editedName.trim() && editedName !== template.name) {
      await updateTemplate({
        templateId,
        name: editedName.trim()
      });
    }
    setIsEditingName(false);
    setEditedName('');
  };

  const handleUpdateDescription = async () => {
    if (editedDescription !== template.description) {
      await updateTemplate({
        templateId,
        description: editedDescription.trim() || undefined
      });
    }
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  const handleTogglePublic = async () => {
    await updateTemplate({
      templateId,
      isPublic: !template.isPublic
    });
  };

  const handleDeleteTemplate = async () => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      await deleteTemplate({ templateId });
      router.push('/templates');
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
        {/* Back Button */}
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>

        {/* Template Header */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-start gap-6">
            {/* Template Preview Image - Rounded Square */}
            <div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 overflow-hidden">
              {template.imageUrl ? (
                <Image
                  src={template.imageUrl}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  priority
                />
              ) : (
                <>
                  {/* Decorative elements for fallback */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-2 left-2 w-12 h-12 bg-primary/20 rounded-full blur-xl" />
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary/15 rounded-full blur-lg" />
                  </div>
                  {/* Template Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary/40" />
                  </div>
                </>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
              {/* Template Name */}
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setEditedName('');
                      }
                    }}
                  />
                  <button
                    onClick={handleUpdateName}
                    className="p-1 rounded hover:bg-muted/50 text-green-600"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName('');
                    }}
                    className="p-1 rounded hover:bg-muted/50 text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2 group">
                  <h1 className="text-3xl font-bold">{template.name}</h1>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditedName(template.name);
                        setIsEditingName(true);
                      }}
                      className="p-1 rounded hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Template Description */}
              {isEditingDescription ? (
                <div className="mb-4">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full bg-transparent border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={2}
                    placeholder="Describe the vibe..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditingDescription(false);
                        setEditedDescription('');
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleUpdateDescription}
                      className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setEditedDescription('');
                      }}
                      className="px-3 py-1 border hover:bg-muted/50 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <p className="text-muted-foreground flex items-center gap-2">
                    {template.description || (
                      <span className="italic">No description yet</span>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditedDescription(template.description || '');
                          setIsEditingDescription(true);
                        }}
                        className="p-1 rounded hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </p>
                </div>
              )}

              {/* Template Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{template.usageCount || 0} uses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Template Actions */}
            <div className="flex items-center gap-2">
              {/* Public/Private Badge & Toggle */}
              {isOwner ? (
                <button
                  onClick={handleTogglePublic}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                    template.isPublic
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {template.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                </button>
              ) : (
                <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  template.isPublic
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                }`}>
                  {template.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              )}

              {/* Delete Button */}
              {isOwner && (
                <button
                  onClick={handleDeleteTemplate}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'variants'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Variants
          {activeTab === 'variants' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'screenshots'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Screenshots ({templateScreenshots?.length || 0})
          {activeTab === 'screenshots' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'variants' ? (
          <motion.div
            key="variants"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Variants Section */}
            <div className="space-y-4">
              {/* Add Variant Button */}
              {isOwner && (
                <button
                  onClick={() => setShowCreateVariant(true)}
                  className="w-full p-4 rounded-xl border-2 border-dashed hover:border-primary/30 hover:bg-card/50 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-muted-foreground group-hover:text-foreground">
                    Create New Variant
                  </span>
                </button>
              )}

              {/* Variants List */}
              {(!templateVariants || templateVariants.length === 0) ? (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No variants yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create variants to define different styles and prompts
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templateVariants.map((variant, index) => (
                    <motion.div
                      key={variant._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border bg-card hover:shadow-md transition-all ${
                        variant.isActive ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Version {variant.version}</h3>
                            {variant.isActive && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {variant.basePrompt}
                          </p>
                          {variant.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              {variant.notes}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {variant.styleSettings.colorScheme && (
                              <span className="px-2 py-1 bg-muted rounded text-xs">
                                {variant.styleSettings.colorScheme}
                              </span>
                            )}
                            {variant.styleSettings.artStyle && (
                              <span className="px-2 py-1 bg-muted rounded text-xs">
                                {variant.styleSettings.artStyle}
                              </span>
                            )}
                            {variant.styleSettings.mood && (
                              <span className="px-2 py-1 bg-muted rounded text-xs">
                                {variant.styleSettings.mood}
                              </span>
                            )}
                          </div>
                        </div>
                        {isOwner && (
                          <div className="flex items-center gap-2">
                            {!variant.isActive && (
                              <button
                                onClick={() => setActiveVariant({ variantId: variant._id })}
                                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm"
                              >
                                Set Active
                              </button>
                            )}
                            {templateVariants.length > 1 && (
                              <button
                                onClick={() => deleteVariant({ variantId: variant._id })}
                                className="p-1 rounded hover:bg-red-500/10 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="screenshots"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Screenshots Section */}
            {(!templateScreenshots || templateScreenshots.length === 0) ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No screenshots yet</p>
                <p className="text-sm text-muted-foreground">
                  Screenshots created with this template will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {templateScreenshots.map((screenshot, index) => (
                  <motion.div
                    key={screenshot._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="relative aspect-[9/16] rounded-lg border bg-card overflow-hidden">
                      {screenshot.imageUrl ? (
                        <Image
                          src={screenshot.imageUrl}
                          alt={screenshot.headerText}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/20">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium truncate">
                            {screenshot.headerText}
                          </p>
                          {screenshot.subheaderText && (
                            <p className="text-white/80 text-xs truncate">
                              {screenshot.subheaderText}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Variant Modal */}
      <AnimatePresence>
        {showCreateVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateVariant(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
            >
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create New Variant</h2>
                <button
                  onClick={() => setShowCreateVariant(false)}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground">
                  Variant creation form will go here...
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}