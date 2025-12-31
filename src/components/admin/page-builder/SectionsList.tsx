import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Menu, Layout, Info, Calendar, Users, Heart, FileText, UserPlus, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSection, SectionType, SECTION_LABELS } from "@/types/pageBuilder";

interface SectionsListProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (sectionId: string) => void;
  onVisibilityToggle: (sectionId: string) => void;
  onReorder: (newOrder: PageSection[]) => void;
}

const SECTION_ICON_MAP: Record<SectionType, React.ReactNode> = {
  navbar: <Menu className="h-4 w-4" />,
  hero: <Layout className="h-4 w-4" />,
  about: <Info className="h-4 w-4" />,
  events: <Calendar className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  sponsors: <Heart className="h-4 w-4" />,
  blog: <FileText className="h-4 w-4" />,
  register: <UserPlus className="h-4 w-4" />,
  footer: <Footprints className="h-4 w-4" />,
};

interface SortableSectionItemProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onVisibilityToggle: () => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isSelected,
  onSelect,
  onVisibilityToggle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "bg-primary/10 border-primary"
          : "bg-white border-gray-200 hover:border-gray-300",
        isDragging && "opacity-50 shadow-lg",
        !section.is_visible && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Icon */}
      <span className={cn(
        "flex-shrink-0",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        {SECTION_ICON_MAP[section.section_type]}
      </span>

      {/* Label */}
      <span className={cn(
        "flex-1 text-sm font-medium truncate",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {SECTION_LABELS[section.section_type]}
      </span>

      {/* Visibility toggle */}
      <button
        className={cn(
          "p-1 rounded hover:bg-gray-100 transition-colors",
          section.is_visible ? "text-muted-foreground" : "text-red-400"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onVisibilityToggle();
        }}
        title={section.is_visible ? "Скрыть секцию" : "Показать секцию"}
      >
        {section.is_visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  selectedSectionId,
  onSelect,
  onVisibilityToggle,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newOrder = arrayMove(sections, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-3">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Секции страницы
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isSelected={section.id === selectedSectionId}
                onSelect={() => onSelect(section.id)}
                onVisibilityToggle={() => onVisibilityToggle(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionsList;
