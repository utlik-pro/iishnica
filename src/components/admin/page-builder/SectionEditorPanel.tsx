import React from "react";
import { PageSection, SectionConfig, SECTION_LABELS, SectionType } from "@/types/pageBuilder";
import NavbarEditor from "./editors/NavbarEditor";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import EventsEditor from "./editors/EventsEditor";
import TeamEditor from "./editors/TeamEditor";
import SponsorsEditor from "./editors/SponsorsEditor";
import BlogEditor from "./editors/BlogEditor";
import RegisterEditor from "./editors/RegisterEditor";
import FooterEditor from "./editors/FooterEditor";

interface SectionEditorPanelProps {
  section: PageSection;
  onConfigChange: (config: SectionConfig) => void;
}

const EDITORS: Record<SectionType, React.ComponentType<{ config: any; onChange: (config: any) => void }>> = {
  navbar: NavbarEditor,
  hero: HeroEditor,
  about: AboutEditor,
  events: EventsEditor,
  team: TeamEditor,
  sponsors: SponsorsEditor,
  blog: BlogEditor,
  register: RegisterEditor,
  footer: FooterEditor,
};

const SectionEditorPanel: React.FC<SectionEditorPanelProps> = ({
  section,
  onConfigChange,
}) => {
  const Editor = EDITORS[section.section_type];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold">
          {SECTION_LABELS[section.section_type]}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Настройте содержимое секции
        </p>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Editor
          config={section.config}
          onChange={onConfigChange}
        />
      </div>
    </div>
  );
};

export default SectionEditorPanel;
