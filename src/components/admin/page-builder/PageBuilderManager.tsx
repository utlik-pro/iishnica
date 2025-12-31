import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Save, Loader2 } from "lucide-react";
import {
  PageSection,
  SectionType,
  DEFAULT_CONFIGS,
  SectionConfig
} from "@/types/pageBuilder";
import SectionsList from "./SectionsList";
import SectionEditorPanel from "./SectionEditorPanel";
import LivePreview from "./LivePreview";

const DEFAULT_SECTIONS: Omit<PageSection, 'id' | 'page_config_id' | 'created_at' | 'updated_at'>[] = [
  { section_type: 'navbar', order_index: 0, is_visible: true, config: DEFAULT_CONFIGS.navbar },
  { section_type: 'hero', order_index: 1, is_visible: true, config: DEFAULT_CONFIGS.hero },
  { section_type: 'about', order_index: 2, is_visible: true, config: DEFAULT_CONFIGS.about },
  { section_type: 'events', order_index: 3, is_visible: true, config: DEFAULT_CONFIGS.events },
  { section_type: 'blog', order_index: 4, is_visible: true, config: DEFAULT_CONFIGS.blog },
  { section_type: 'team', order_index: 5, is_visible: true, config: DEFAULT_CONFIGS.team },
  { section_type: 'sponsors', order_index: 6, is_visible: true, config: DEFAULT_CONFIGS.sponsors },
  { section_type: 'register', order_index: 7, is_visible: true, config: DEFAULT_CONFIGS.register },
  { section_type: 'footer', order_index: 8, is_visible: true, config: DEFAULT_CONFIGS.footer },
];

const PageBuilderManager = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageConfigId, setPageConfigId] = useState<string | null>(null);

  useEffect(() => {
    fetchPageConfig();
  }, []);

  const fetchPageConfig = async () => {
    try {
      // First, try to get existing page config
      let { data: pageConfig, error: configError } = await supabase
        .from('page_configs')
        .select('*')
        .eq('page_slug', 'home')
        .single();

      if (configError && configError.code === 'PGRST116') {
        // No config exists, create one
        const { data: newConfig, error: createError } = await supabase
          .from('page_configs')
          .insert({ page_slug: 'home', name: 'Главная страница', is_published: true })
          .select()
          .single();

        if (createError) throw createError;
        pageConfig = newConfig;

        // Create default sections
        const sectionsToInsert = DEFAULT_SECTIONS.map(s => ({
          ...s,
          page_config_id: newConfig.id,
        }));

        const { error: sectionsError } = await supabase
          .from('page_sections')
          .insert(sectionsToInsert);

        if (sectionsError) throw sectionsError;
      } else if (configError) {
        throw configError;
      }

      setPageConfigId(pageConfig.id);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_config_id', pageConfig.id)
        .order('order_index', { ascending: true });

      if (sectionsError) throw sectionsError;

      if (sectionsData && sectionsData.length > 0) {
        setSections(sectionsData as PageSection[]);
        setSelectedSectionId(sectionsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching page config:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить конфигурацию страницы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  const handleVisibilityToggle = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newVisibility = !section.is_visible;

    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, is_visible: newVisibility } : s
    ));

    try {
      const { error } = await supabase
        .from('page_sections')
        .update({ is_visible: newVisibility, updated_at: new Date().toISOString() })
        .eq('id', sectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating visibility:', error);
      // Revert on error
      setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, is_visible: !newVisibility } : s
      ));
    }
  };

  const handleReorder = async (newOrder: PageSection[]) => {
    const updatedSections = newOrder.map((section, index) => ({
      ...section,
      order_index: index,
    }));

    setSections(updatedSections);

    try {
      // Update all sections with new order
      for (const section of updatedSections) {
        await supabase
          .from('page_sections')
          .update({ order_index: section.order_index, updated_at: new Date().toISOString() })
          .eq('id', section.id);
      }
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить порядок секций",
        variant: "destructive",
      });
    }
  };

  const handleConfigChange = (sectionId: string, newConfig: SectionConfig) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, config: newConfig } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedSection = sections.find(s => s.id === selectedSectionId);
      if (!selectedSection) return;

      const { error } = await supabase
        .from('page_sections')
        .update({
          config: selectedSection.config as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSectionId);

      if (error) throw error;

      toast({
        title: "Сохранено",
        description: "Изменения успешно сохранены",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPreview = () => {
    window.open('/', '_blank');
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold">Конструктор страницы</h2>
          <p className="text-sm text-muted-foreground">Настройте секции главной страницы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenPreview}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Открыть сайт
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить
          </Button>
        </div>
      </div>

      {/* Main content - 3 columns */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left column - Sections list */}
        <div className="w-56 flex-shrink-0">
          <SectionsList
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelect={handleSectionSelect}
            onVisibilityToggle={handleVisibilityToggle}
            onReorder={handleReorder}
          />
        </div>

        {/* Middle column - Section editor */}
        <div className="w-96 flex-shrink-0 overflow-y-auto border rounded-lg bg-white">
          {selectedSection ? (
            <SectionEditorPanel
              section={selectedSection}
              onConfigChange={(config) => handleConfigChange(selectedSection.id, config)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Выберите секцию для редактирования
            </div>
          )}
        </div>

        {/* Right column - Live preview */}
        <div className="flex-1 min-w-0 border rounded-lg bg-gray-100 overflow-hidden">
          <LivePreview sections={sections} />
        </div>
      </div>
    </div>
  );
};

export default PageBuilderManager;
