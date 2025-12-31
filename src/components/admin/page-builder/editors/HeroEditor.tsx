import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { HeroConfig } from "@/types/pageBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroEditorProps {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
}

const HeroEditor: React.FC<HeroEditorProps> = ({ config, onChange }) => {
  const updateButton = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      buttons: config.buttons.map(btn =>
        btn.id === id ? { ...btn, [field]: value } : btn
      ),
    });
  };

  const addButton = () => {
    onChange({
      ...config,
      buttons: [
        ...config.buttons,
        { id: Date.now().toString(), text: 'Новая кнопка', variant: 'outline' as const, target: '#' },
      ],
    });
  };

  const removeButton = (id: string) => {
    onChange({
      ...config,
      buttons: config.buttons.filter(btn => btn.id !== id),
    });
  };

  const updateBadge = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      badges: config.badges.map(badge =>
        badge.id === id ? { ...badge, [field]: value } : badge
      ),
    });
  };

  const addBadge = () => {
    onChange({
      ...config,
      badges: [
        ...config.badges,
        { id: Date.now().toString(), icon: 'calendar' as const, text: 'Новый бейдж', color: 'green' as const },
      ],
    });
  };

  const removeBadge = (id: string) => {
    onChange({
      ...config,
      badges: config.badges.filter(badge => badge.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Заголовок</h4>

        <div className="space-y-2">
          <Label htmlFor="hero-title">Главный заголовок</Label>
          <Input
            id="hero-title"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder="ИИшница"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Подзаголовок</Label>
          <Textarea
            id="hero-subtitle"
            value={config.subtitle}
            onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
            placeholder="Еженедельные практические завтраки..."
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Кнопки</h4>
          <Button size="sm" variant="outline" onClick={addButton}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-3">
          {config.buttons.map((button) => (
            <div key={button.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={button.text}
                  onChange={(e) => updateButton(button.id, 'text', e.target.value)}
                  placeholder="Текст кнопки"
                  className="flex-1 h-8"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removeButton(button.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Select
                  value={button.variant}
                  onValueChange={(value) => updateButton(button.id, 'variant', value)}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Основная</SelectItem>
                    <SelectItem value="outline">Контурная</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={button.target}
                  onChange={(e) => updateButton(button.id, 'target', e.target.value)}
                  placeholder="#register или /page"
                  className="flex-1 h-8"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Бейджи</h4>
          <Button size="sm" variant="outline" onClick={addBadge}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-3">
          {config.badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
              <Select
                value={badge.icon}
                onValueChange={(value) => updateBadge(badge.id, 'icon', value)}
              >
                <SelectTrigger className="h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calendar">Календарь</SelectItem>
                  <SelectItem value="clock">Часы</SelectItem>
                  <SelectItem value="wallet">Кошелек</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={badge.text}
                onChange={(e) => updateBadge(badge.id, 'text', e.target.value)}
                placeholder="Текст бейджа"
                className="flex-1 h-8"
              />

              <Select
                value={badge.color}
                onValueChange={(value) => updateBadge(badge.id, 'color', value)}
              >
                <SelectTrigger className="h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Зеленый</SelectItem>
                  <SelectItem value="blue">Синий</SelectItem>
                  <SelectItem value="purple">Фиолетовый</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500"
                onClick={() => removeBadge(badge.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
