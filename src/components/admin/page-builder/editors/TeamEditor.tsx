import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamConfig } from "@/types/pageBuilder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

interface TeamEditorProps {
  config: TeamConfig;
  onChange: (config: TeamConfig) => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({ config, onChange }) => {
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
            <Label htmlFor="team-prefix">Префикс</Label>
            <Input
              id="team-prefix"
              value={config.title.prefix}
              onChange={(e) => updateTitle('prefix', e.target.value)}
              placeholder="Наша"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="team-highlight">Выделение</Label>
            <Input
              id="team-highlight"
              value={config.title.highlight}
              onChange={(e) => updateTitle('highlight', e.target.value)}
              placeholder="команда"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-description">Описание</Label>
        <Textarea
          id="team-description"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Познакомьтесь с людьми, которые делают ИИшницу..."
          rows={2}
        />
      </div>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Члены команды загружаются из раздела "Спикеры". Отметьте спикера как "Член команды" в разделе Спикеры, чтобы он появился здесь.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TeamEditor;
