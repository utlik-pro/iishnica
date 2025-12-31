import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { FooterConfig } from "@/types/pageBuilder";

interface FooterEditorProps {
  config: FooterConfig;
  onChange: (config: FooterConfig) => void;
}

const FooterEditor: React.FC<FooterEditorProps> = ({ config, onChange }) => {
  const updateLogo = (field: keyof FooterConfig['logo'], value: string) => {
    onChange({
      ...config,
      logo: { ...config.logo, [field]: value },
    });
  };

  const updateContacts = (field: keyof FooterConfig['contacts'], value: string) => {
    onChange({
      ...config,
      contacts: { ...config.contacts, [field]: value },
    });
  };

  const updateNavItem = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      navigation: {
        ...config.navigation,
        items: config.navigation.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  const addNavItem = () => {
    onChange({
      ...config,
      navigation: {
        ...config.navigation,
        items: [
          ...config.navigation.items,
          { id: Date.now().toString(), label: 'Новый пункт', type: 'scroll' as const, target: '' },
        ],
      },
    });
  };

  const removeNavItem = (id: string) => {
    onChange({
      ...config,
      navigation: {
        ...config.navigation,
        items: config.navigation.items.filter(item => item.id !== id),
      },
    });
  };

  const updateBottomLink = (id: string, field: string, value: string) => {
    onChange({
      ...config,
      bottomLinks: config.bottomLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    });
  };

  const addBottomLink = () => {
    onChange({
      ...config,
      bottomLinks: [
        ...config.bottomLinks,
        { id: Date.now().toString(), label: 'Новая ссылка', target: '' },
      ],
    });
  };

  const removeBottomLink = (id: string) => {
    onChange({
      ...config,
      bottomLinks: config.bottomLinks.filter(link => link.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Логотип</h4>

        <div className="space-y-2">
          <Label htmlFor="footer-title">Название</Label>
          <Input
            id="footer-title"
            value={config.logo.title}
            onChange={(e) => updateLogo('title', e.target.value)}
            placeholder="ИИшница"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-tagline">Слоган</Label>
          <Input
            id="footer-tagline"
            value={config.logo.tagline}
            onChange={(e) => updateLogo('tagline', e.target.value)}
            placeholder="Мероприятия от M.AI.N - AI Community"
          />
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Навигация</h4>
          <Button size="sm" variant="outline" onClick={addNavItem}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nav-title">Заголовок раздела</Label>
          <Input
            id="nav-title"
            value={config.navigation.title}
            onChange={(e) => onChange({
              ...config,
              navigation: { ...config.navigation, title: e.target.value }
            })}
            placeholder="Навигация"
          />
        </div>

        <div className="space-y-2">
          {config.navigation.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.label}
                onChange={(e) => updateNavItem(item.id, 'label', e.target.value)}
                placeholder="Название"
                className="flex-1 h-8"
              />
              <Input
                value={item.target}
                onChange={(e) => updateNavItem(item.id, 'target', e.target.value)}
                placeholder="about"
                className="w-24 h-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500"
                onClick={() => removeNavItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Contacts */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Контакты</h4>

        <div className="space-y-2">
          <Label htmlFor="contacts-title">Заголовок раздела</Label>
          <Input
            id="contacts-title"
            value={config.contacts.title}
            onChange={(e) => updateContacts('title', e.target.value)}
            placeholder="Контакты"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contacts-email">Email</Label>
          <Input
            id="contacts-email"
            value={config.contacts.email}
            onChange={(e) => updateContacts('email', e.target.value)}
            placeholder="admin@utlik.pro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contacts-phone">Телефон</Label>
          <Input
            id="contacts-phone"
            value={config.contacts.phone}
            onChange={(e) => updateContacts('phone', e.target.value)}
            placeholder="+375 44 755 4000"
          />
        </div>
      </div>

      <Separator />

      {/* Bottom bar */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Нижняя панель</h4>

        <div className="space-y-2">
          <Label htmlFor="copyright">Копирайт (используйте {'{year}'} для года)</Label>
          <Input
            id="copyright"
            value={config.copyright}
            onChange={(e) => onChange({ ...config, copyright: e.target.value })}
            placeholder="© {year} ИИшница. M.AI.N - AI Community"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Ссылки внизу</Label>
          <Button size="sm" variant="outline" onClick={addBottomLink}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        <div className="space-y-2">
          {config.bottomLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateBottomLink(link.id, 'label', e.target.value)}
                placeholder="Политика конфиденциальности"
                className="flex-1 h-8"
              />
              <Input
                value={link.target}
                onChange={(e) => updateBottomLink(link.id, 'target', e.target.value)}
                placeholder="privacy"
                className="w-24 h-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500"
                onClick={() => removeBottomLink(link.id)}
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

export default FooterEditor;
