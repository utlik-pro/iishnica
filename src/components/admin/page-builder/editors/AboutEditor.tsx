import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { AboutConfig } from "@/types/pageBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AboutEditorProps {
  config: AboutConfig;
  onChange: (config: AboutConfig) => void;
}

const AboutEditor: React.FC<AboutEditorProps> = ({ config, onChange }) => {
  const updateTitle = (field: 'prefix' | 'highlight', value: string) => {
    onChange({
      ...config,
      title: { ...config.title, [field]: value },
    });
  };

  const updateCard = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      cards: config.cards.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      ),
    });
  };

  const addCard = () => {
    onChange({
      ...config,
      cards: [
        ...config.cards,
        { id: Date.now().toString(), icon: 'calendar' as const, title: 'Новая карточка', description: '' },
      ],
    });
  };

  const removeCard = (id: string) => {
    onChange({
      ...config,
      cards: config.cards.filter(card => card.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Заголовок</h4>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="about-prefix">Префикс</Label>
            <Input
              id="about-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Что такое"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="about-highlight">Выделение</Label>
            <Input
              id="about-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="ИИшница"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="about-description">Описание</Label>
        <Textarea
          id="about-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="ИИшница — это еженедельный клуб-завтрак..."
          rows={3}
        />
      </div>

      <Separator />

      {/* Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Карточки</h4>
          <Button size="sm" variant="outline" onClick={addCard}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-3">
          {config.cards.map((card) => (
            <div key={card.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  value={card.icon}
                  onValueChange={(value) => updateCard(card.id, 'icon', value)}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Календарь</SelectItem>
                    <SelectItem value="message">Сообщение</SelectItem>
                    <SelectItem value="users">Люди</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={card.title}
                  onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                  placeholder="Заголовок карточки"
                  className="flex-1 h-8"
                />

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removeCard(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={card.description}
                onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                placeholder="Описание карточки"
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;
