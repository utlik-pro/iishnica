import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RegisterConfig } from "@/types/pageBuilder";

interface RegisterEditorProps {
  config: RegisterConfig;
  onChange: (config: RegisterConfig) => void;
}

const RegisterEditor: React.FC<RegisterEditorProps> = ({ config, onChange }) => {
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
        <h4 className="text-sm font-semibold">Заголовок секции</h4>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="register-prefix">Префикс</Label>
            <Input
              id="register-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Присоединяйтесь к"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="register-highlight">Выделение</Label>
            <Input
              id="register-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="ИИшнице"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-description">Описание</Label>
        <Textarea
          id="register-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Зарегистрируйтесь, чтобы получать уведомления..."
          rows={2}
        />
      </div>

      <Separator />

      {/* Form settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Настройки формы</h4>

        <div className="space-y-2">
          <Label htmlFor="form-title">Заголовок формы</Label>
          <Input
            id="form-title"
            value={config.formTitle}
            onChange={(e) => onChange({ ...config, formTitle: e.target.value })}
            placeholder="Регистрация"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-description">Описание формы</Label>
          <Input
            id="form-description"
            value={config.formDescription}
            onChange={(e) => onChange({ ...config, formDescription: e.target.value })}
            placeholder="Заполните форму, чтобы присоединиться..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submit-button">Текст кнопки отправки</Label>
          <Input
            id="submit-button"
            value={config.submitButtonText}
            onChange={(e) => onChange({ ...config, submitButtonText: e.target.value })}
            placeholder="Зарегистрироваться"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="privacy-text">Текст о конфиденциальности</Label>
          <Textarea
            id="privacy-text"
            value={config.privacyText}
            onChange={(e) => onChange({ ...config, privacyText: e.target.value })}
            placeholder="Регистрируясь, вы соглашаетесь..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterEditor;
