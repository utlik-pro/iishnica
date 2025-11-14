
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TicketSenderProps {
  leadId: string;
  leadName: string;
  leadEmail: string;
  onSuccess?: () => void;
}

const TicketSender: React.FC<TicketSenderProps> = ({ leadId, leadName, leadEmail, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sendTicket = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('send_ticket', { lead_id: leadId });

      if (error) throw error;

      toast({
        title: "Билет отправлен",
        description: `Билет успешно отправлен на почту ${leadEmail}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending ticket:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить билет. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={sendTicket} disabled={loading}>
      {loading ? "Отправка..." : "Отправить билет"}
    </Button>
  );
};

export default TicketSender;
