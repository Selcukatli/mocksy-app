'use client';

import {
  Plus,
  Sparkles,
  Copy,
  Globe,
  Lock,
  TrendingUp,
  Search,
  X,
  ChevronRight,
  MoreVertical,
  Trash2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TemplatesPage() {
  const { user } = useUser();
  const isSignedIn = !!user;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'public'>('all');
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: Id<"templates">, name: string} | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState(false);

  // Fetch templates
  const myTemplates = useQuery(api.templates.getMyTemplates) || [];
  const publicTemplates = useQuery(api.templates.getPublicTemplates, { limit: 50 }) || [];
  const createTemplateMutation = useMutation(api.templates.createTemplate);
  const duplicateTemplateMutation = useMutation(api.templates.duplicateTemplate);
  const deleteTemplateMutation = useMutation(api.templates.deleteTemplate);
  const generateUploadUrl = useMutation(api.fileStorage.files.generateUploadUrl);

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
      let referenceImageStorageId: Id<"_storage"> | undefined;

      // Upload reference image if provided
      if (referenceImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': referenceImage.type },
          body: referenceImage,
        });
        const { storageId } = await result.json();
        referenceImageStorageId = storageId;
      }

      await createTemplateMutation({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        isPublic,
        referenceImageStorageId
      });

      setShowCreateDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      setIsPublic(false);
      setReferenceImage(null);
      setReferenceImagePreview(null);
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSetReferenceImage = useCallback((file: File) => {
    setReferenceImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSetReferenceImage(file);
    }
  };

  useEffect(() => {
    if (!showCreateDialog) {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (!file) continue;

        const fileWithName = file.name
          ? file
          : new File([file], `pasted-image-${Date.now()}.png`, {
              type: file.type || 'image/png',
            });

        handleSetReferenceImage(fileWithName);
        event.preventDefault();
        break;
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [showCreateDialog, handleSetReferenceImage]);

  const handleDuplicateTemplate = async (e: React.MouseEvent, templateId: Id<"templates">, originalName: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await duplicateTemplateMutation({
        templateId,
        newName: `${originalName} (Copy)`
      });
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteConfirmation) return;

    setDeletingTemplate(true);
    try {
      await deleteTemplateMutation({ templateId: deleteConfirmation.id });
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setDeletingTemplate(false);
      setShowDeleteMenu(null);
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
              className="group relative"
            >
              <Link href={`/templates/${template._id}`} className="block">
                <div className="rounded-xl border bg-card hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden cursor-pointer">
                {/* Template Preview Area */}
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                  {template.imageUrl ? (
                    <Image
                      src={template.imageUrl}
                      alt={template.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <>
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-4 right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                      </div>

                      {/* Template Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-primary/60" />
                      </div>
                    </>
                  )}

                  {/* Ownership Badge - Top Left */}
                  <div className="absolute top-3 left-3">
                    {template.isPublic ? (
                      <div className="px-2 py-1 bg-green-500/20 backdrop-blur-sm text-green-600 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-gray-500/20 backdrop-blur-sm text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                  </div>

                  {/* Actions Menu - Top Right (only for owned templates) */}
                  {template.profileId === myTemplates[0]?.profileId && (
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowDeleteMenu(showDeleteMenu === template._id ? null : template._id);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showDeleteMenu === template._id && (
                        <div className="absolute right-0 mt-1 bg-card border rounded-lg shadow-lg py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteConfirmation({ id: template._id, name: template.name });
                              setShowDeleteMenu(null);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors text-destructive w-full text-left"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {template.profileId !== myTemplates[0]?.profileId && (
                        <button
                          onClick={(e) => handleDuplicateTemplate(e, template._id, template.name)}
                          className="px-3 py-1.5 bg-muted/50 hover:bg-muted text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Use Template
                        </button>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
              </Link>
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
                setReferenceImage(null);
                setReferenceImagePreview(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-md md:max-w-2xl mx-4"
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
              <div className="p-6">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-6">
                  <div className="space-y-4">
                    {/* Template Name */}
                    <div>
                      <label htmlFor="template-name" className="text-sm font-medium mb-1.5 block">
                        Template name
                      </label>
                      <input
                        id="template-name"
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Dark Gradient, Minimal Tech"
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
                        placeholder="Describe the style or mood..."
                        className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[60px] resize-none"
                      />
                    </div>

                    {/* Public/Private Toggle */}
                    <div>
                      <label className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          {isPublic ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm font-medium">
                            {isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPublic(!isPublic)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            isPublic ? 'bg-green-600' : 'bg-muted'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Reference Image Upload */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Reference image <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          id="reference-image"
                          accept="image/*"
                          onChange={handleReferenceImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="reference-image"
                          className={`flex min-h-[216px] items-center justify-center gap-2 w-full px-3 ${referenceImagePreview ? 'py-4' : 'py-8'} rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors`}
                        >
                          {referenceImagePreview ? (
                            <div className="relative">
                              <Image
                                src={referenceImagePreview}
                                alt="Reference preview"
                                width={256}
                                height={256}
                                unoptimized
                                className="max-h-48 w-auto rounded-lg object-contain"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setReferenceImage(null);
                                  setReferenceImagePreview(null);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-background border rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Paste or upload inspiration image
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
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

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirmation(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-md mx-4"
            >
              {/* Dialog Header */}
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">Delete Template</h2>
              </div>

              {/* Dialog Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to delete <span className="font-medium text-foreground">&quot;{deleteConfirmation.name}&quot;</span>?
                </p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. All template variants and generated screenshots will be permanently deleted.
                </p>
              </div>

              {/* Dialog Footer */}
              <div className="border-t px-6 py-4 flex gap-2">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  disabled={deletingTemplate}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTemplate}
                  disabled={deletingTemplate}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {deletingTemplate && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-200, 200] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="relative">
                    {deletingTemplate ? 'Deleting...' : 'Delete Template'}
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
