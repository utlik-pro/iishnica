import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EventsConfig } from "@/types/pageBuilder";

interface EventsEditorProps {
  config: EventsConfig;
  onChange: (config: EventsConfig) => void;
}

const EventsEditor: React.FC<EventsEditorProps> = ({ config, onChange }) => {
  const updateTitle = (field: 'prefix' | 'highlight', value: string) => {
    onChange({
      ...config,
      title: { ...config.title, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Заголовок</h4>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="events-prefix">Префикс</Label>
            <Input
              id="events-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Расписание ближайших"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="events-highlight">Выделение</Label>
            <Input
              id="events-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="завтраков"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="events-description">Подзаголовок</Label>
        <Textarea
          id="events-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Присоединяйтесь к нашим еженедельным встречам..."
          rows={2}
        />
      </div>

      <Separator />

      {/* Display settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Настройки отображения</h4>

        <div className="space-y-2">
          <Label htmlFor="events-max">Количество мероприятий</Label>
          <Input
            id="events-max"
            type="number"
            min={1}
            max={10}
            value={config.maxItems}
            onChange={(e) => onChange({ ...config, maxItems: parseInt(e.target.value) || 3 })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="events-calendar">Показывать календарь</Label>
          <Switch
            id="events-calendar"
            checked={config.showCalendar}
            onCheckedChange={(checked) => onChange({ ...config, showCalendar: checked })}
          />
        </div>
      </div>

      <Separator />

      {/* Sidebar */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Боковая панель</h4>

        <div className="space-y-2">
          <Label htmlFor="sidebar-title">Заголовок</Label>
          <Input
            id="sidebar-title"
            value={config.sidebarTitle}
            onChange={(e) => onChange({ ...config, sidebarTitle: e.target.value })}
            placeholder="Регулярные встречи"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sidebar-description">Описание</Label>
          <Textarea
            id="sidebar-description"
            value={config.sidebarDescription}
            onChange={(e) => onChange({ ...config, sidebarDescription: e.target.value })}
            placeholder="Наши завтраки проходят каждый вторник..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-info">Информация о цене (поддерживает HTML)</Label>
          <Input
            id="price-info"
            value={config.priceInfo}
            onChange={(e) => onChange({ ...config, priceInfo: e.target.value })}
            placeholder="Стоимость — <strong>25 BYN</strong>"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-text">Текст кнопки</Label>
          <Input
            id="button-text"
            value={config.buttonText}
            onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
            placeholder="Посмотреть все мероприятия"
          />
        </div>
      </div>
    </div>
  );
};

export default EventsEditor;
