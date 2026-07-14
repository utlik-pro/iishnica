import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegisterConfig, DEFAULT_REGISTER_CONFIG } from "@/types/pageBuilder";

interface RegisterSectionProps {
  config?: RegisterConfig;
}

const RegisterSection: React.FC<RegisterSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_REGISTER_CONFIG;
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Очищаем предыдущую ошибку при начале ввода
      setPhoneError("");
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validatePhone = (phone: string): boolean => {
    // Очищаем телефон от всех символов, кроме цифр и +
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    
    // Проверяем формат телефона (начинается с +375 или +7)
    const isValidBelarusPhone = /^\+375\d{9}$/.test(cleanPhone);
    const isValidRussianPhone = /^\+7\d{10}$/.test(cleanPhone);
    
    if (!isValidBelarusPhone && !isValidRussianPhone) {
      setPhoneError("Введите номер в формате +375XXXXXXXXX или +7XXXXXXXXXX");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    
    // Валидируем номер телефона
    if (!validatePhone(formData.phone)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Отправляем данные в Supabase
      const { error } = await supabase
        .from("leads")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source: 'web'
          }
        ]);
      
      if (error) throw error;
      
      // Показываем сообщение об успехе
      toast({
        title: "Регистрация успешна!",
        description: "Мы свяжемся с вами в ближайшее время",
      });
      
      // Сбрасываем форму
      setFormData({
        name: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Ошибка отправки данных",
        description: "Пожалуйста, попробуйте еще раз позже",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-12 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 ambient-lime pointer-events-none" aria-hidden />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 tracking-tight">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2">
            {cfg.description}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="rounded-2xl border-white/[0.08] bg-card/80 backdrop-blur-sm shadow-card">
            <CardHeader>
              <CardTitle>{cfg.formTitle}</CardTitle>
              <CardDescription>
                {cfg.formDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Введите ваше имя"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+375XXXXXXXXX или +7XXXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Введите номер телефона в формате +375XXXXXXXXX или +7XXXXXXXXXX
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full rounded-full font-semibold bg-primary text-primary-foreground hover:bg-lime-dark shadow-lime-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Отправка..." : cfg.submitButtonText}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {cfg.privacyText}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
