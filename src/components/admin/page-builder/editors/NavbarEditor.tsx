import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { NavbarConfig } from "@/types/pageBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavbarEditorProps {
  config: NavbarConfig;
  onChange: (config: NavbarConfig) => void;
}

const NavbarEditor: React.FC<NavbarEditorProps> = ({ config, onChange }) => {
  const updateLogo = (field: keyof NavbarConfig['logo'], value: string) => {
    onChange({
      ...config,
      logo: { ...config.logo, [field]: value },
    });
  };

  const updateCtaButton = (field: keyof NavbarConfig['ctaButton'], value: string | boolean) => {
    onChange({
      ...config,
      ctaButton: { ...config.ctaButton, [field]: value },
    });
  };

  const updateMenuItem = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      menuItems: config.menuItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const addMenuItem = () => {
    onChange({
      ...config,
      menuItems: [
        ...config.menuItems,
        { id: Date.now().toString(), label: 'Новый пункт', type: 'scroll' as const, target: '' },
      ],
    });
  };

  const removeMenuItem = (id: string) => {
    onChange({
      ...config,
      menuItems: config.menuItems.filter(item => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Логотип</h4>

        <div className="space-y-2">
          <Label htmlFor="logo-image">URL изображения</Label>
          <Input
            id="logo-image"
            value={config.logo.imageUrl}
            onChange={(e) => updateLogo('imageUrl', e.target.value)}
            placeholder="/Main-logo.webp"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-title">Название</Label>
          <Input
            id="logo-title"
            value={config.logo.title}
            onChange={(e) => updateLogo('title', e.target.value)}
            placeholder="ИИшница"
          />
        </div>
      </div>

      <Separator />

      {/* Menu items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Пункты меню</h4>
          <Button size="sm" variant="outline" onClick={addMenuItem}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-3">
          {config.menuItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2 p-3 border rounded-lg bg-gray-50">
              <GripVertical className="h-4 w-4 mt-2 text-muted-foreground cursor-grab" />

              <div className="flex-1 space-y-2">
                <Input
                  value={item.label}
                  onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                  placeholder="Название пункта"
                  className="h-8"
                />

                <div className="flex gap-2">
                  <Select
                    value={item.type}
                    onValueChange={(value) => updateMenuItem(item.id, 'type', value)}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scroll">Скролл</SelectItem>
                      <SelectItem value="link">Ссылка</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={item.target}
                    onChange={(e) => updateMenuItem(item.id, 'target', e.target.value)}
                    placeholder={item.type === 'scroll' ? 'about' : '/calendar'}
                    className="h-8 flex-1"
                  />
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700"
                onClick={() => removeMenuItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* CTA Button */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Кнопка CTA</h4>
          <Switch
            checked={config.ctaButton.isVisible}
            onCheckedChange={(checked) => updateCtaButton('isVisible', checked)}
          />
        </div>

        {config.ctaButton.isVisible && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cta-text">Текст кнопки</Label>
              <Input
                id="cta-text"
                value={config.ctaButton.text}
                onChange={(e) => updateCtaButton('text', e.target.value)}
                placeholder="Регистрация"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-url">Ссылка</Label>
              <Input
                id="cta-url"
                value={config.ctaButton.url}
                onChange={(e) => updateCtaButton('url', e.target.value)}
                placeholder="https://t.me/maincomapp_bot"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarEditor;
