import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SponsorsConfig } from "@/types/pageBuilder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart } from "lucide-react";

interface SponsorsEditorProps {
  config: SponsorsConfig;
  onChange: (config: SponsorsConfig) => void;
}

const SponsorsEditor: React.FC<SponsorsEditorProps> = ({ config, onChange }) => {
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
            <Label htmlFor="sponsors-prefix">Префикс</Label>
            <Input
              id="sponsors-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Наши"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="sponsors-highlight">Выделение</Label>
            <Input
              id="sponsors-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="спонсоры"
            />
          </div>
        </div>
      </div>

      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          Спонсоры загружаются из раздела "Спонсоры". Добавьте спонсоров с логотипами в соответствующем разделе админ-панели.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SponsorsEditor;
