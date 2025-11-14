
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

const RegisterSection = () => {
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
            phone: formData.phone
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
    <section id="register" className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Присоединяйтесь к <span className="gradient-text">ИИшнице</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Зарегистрируйтесь, чтобы получать уведомления о предстоящих мероприятиях и бронировать места на завтраках
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Регистрация</CardTitle>
              <CardDescription>
                Заполните форму, чтобы присоединиться к нашему сообществу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="phone">Телефон <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+375XXXXXXXXX или +7XXXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Введите номер телефона в формате +375XXXXXXXXX или +7XXXXXXXXXX
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Отправка..." : "Зарегистрироваться"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Регистрируясь, вы соглашаетесь с нашей политикой конфиденциальности и условиями использования.
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
