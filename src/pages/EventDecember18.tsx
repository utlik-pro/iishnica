import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar as CalendarIcon, Clock, Wallet, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamSection from "@/components/TeamSection";
import EventLocationMap from "@/components/EventLocationMap";

const EventDecember18 = () => {

  const speakers = [
    {
      name: "Олег Зелинский",
      topic: "limb branding studio",
      description: "Соучредитель и СЕО студии limb, бренд стратег. Руководитель проектов по разработке и реализации стратегии для компаний из РБ, ОАЭ, Казахстана",
      avatar: "ОЗ",
      image: "/zelen.JPEG"
    },
    {
      name: "Алекс Шкор",
      topic: "«Принимаем роды у ИИ»",
      description: "ИИ архитектор, CEO Collective Intelligence Labs",
      avatar: "АШ",
      image: "/shkor.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-44 md:pb-28 relative overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <img src="/og-image.png" alt="" className="w-full h-full object-cover object-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/80" />
          <div className="absolute inset-0 ambient-lime opacity-70" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-primary font-semibold text-sm">Вечернее мероприятие</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-6 tracking-tight leading-[0.95]">
              <span className="text-foreground">Вечерняя </span>
              <span className="gradient-text">ИИшница</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Практические кейсы применения искусственного интеллекта в жизни и в бизнесе
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base"
                onClick={() => window.open('https://telegram.me/maincomapp_bot', '_blank')}
              >
                Зарегистрироваться <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-full">
                <CalendarIcon className="w-6 h-6 text-primary mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Дата</div>
                  <span className="text-lg font-medium text-foreground">18 декабря, четверг</span>
                </div>
              </div>
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-full">
                <Clock className="w-6 h-6 text-primary mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Время</div>
                  <span className="text-lg font-medium text-foreground">18:30</span>
                </div>
              </div>              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-full">
                <Wallet className="w-6 h-6 text-primary mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Стоимость</div>
                  <span className="text-lg font-medium text-foreground">Бесплатно</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-24 left-10 w-24 h-24 bg-primary/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      </section>

      {/* About Community Section */}
      <section id="about" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <img
                  src="/Main-logo.webp"
                  alt="M.AI.N Community Logo"
                  className="h-20 w-auto"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                О <span className="gradient-text">комьюнити</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                M.AI.N — это сообщество энтузиастов и профессионалов в области искусственного интеллекта
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="border border-white/[0.08] bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl mr-4">
                      🎯
                    </div>
                    <h3 className="text-xl font-bold">Наша миссия</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Делать искусственный интеллект доступным и понятным каждому. Мы объединяем специалистов и энтузиастов для обмена опытом и совместного роста.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-white/[0.08] bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl mr-4">
                      🚀
                    </div>
                    <h3 className="text-xl font-bold">Что мы делаем</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Проводим регулярные митапы, мастер-классы и воркшопы по практическому применению ИИ в бизнесе и повседневной жизни.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Присоединяйтесь к нам!</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Станьте частью растущего комьюнити профессионалов, которые используют ИИ для решения реальных задач
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white/[0.05] px-4 py-2 rounded-full">
                      <span className="text-2xl">💡</span>
                      <span className="font-medium">Практические кейсы</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.05] px-4 py-2 rounded-full">
                      <span className="text-2xl">🤝</span>
                      <span className="font-medium">Нетворкинг</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.05] px-4 py-2 rounded-full">
                      <span className="text-2xl">📚</span>
                      <span className="font-medium">Обучение</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-6 pt-4 border-t border-white/[0.12]">
                    <p className="text-sm font-medium text-muted-foreground">Мы в соцсетях:</p>
                    <div className="flex gap-3">
                      <a
                        href="https://telegram.me/maincomby"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center shadow-sm border border-white/[0.08]"
                        aria-label="Telegram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.094.037.308.02.475z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.linkedin.com/company/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center shadow-sm border border-white/[0.08]"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center shadow-sm border border-white/[0.08]"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Speakers & Topics Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Спикеры <span className="gradient-text">мероприятия</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Практические доклады от экспертов в области искусственного интеллекта
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {speakers.map((speaker, index) => (
              <Card key={index} className="border border-white/[0.08] bg-white/[0.05] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {speaker.image ? (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="h-16 w-16 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-4">
                        {speaker.avatar}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{speaker.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        Спикер
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-primary mb-2">{speaker.topic}</h4>
                  <p className="text-sm text-muted-foreground">{speaker.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              <span className="gradient-text">Программа</span> мероприятия
            </h2>
            <p className="text-lg text-muted-foreground">
              Детальное расписание вечера с описанием выступлений
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Networking 1 */}
            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg text-sm">
                    18:30-19:00
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Нетворкинг</h3>
                    <p className="text-muted-foreground">Знакомство участников, общение в неформальной обстановке</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Oleg Zelinsky */}
            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg text-sm">
                    19:00-19:40
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {speakers.find(s => s.name === "Олег Зелинский")?.image ? (
                        <img
                          src={speakers.find(s => s.name === "Олег Зелинский")?.image}
                          alt="Олег Зелинский"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          ОЗ
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">Олег Зелинский</h3>
                        <p className="text-sm text-muted-foreground">Соучредитель и СЕО студии limb, бренд стратег</p>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-primary mb-3">"Суперсила или слабое звено: почему ИИ делает одни кампании успешными, а другие темой для хейта"</h4>
                    <p className="text-muted-foreground mb-3">
                      Технологии развиваются быстрее, чем успевает адаптироваться индустрия: новые модели и инструменты позволяют создавать визуалы, тексты и даже целые кампании за секунды. Но при всей этой скорости остаётся то, чему нейросети до сих пор не научились — передавать настоящую человеческую эмоцию.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      Разберём:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
                      <li>почему ценности бренда становятся ключевым ориентиром для работы ИИ,</li>
                      <li>как нейросети могут усиливать кампании вместо того, чтобы превращать их в поток случайных визуалов,</li>
                      <li>и что помогает компаниям сохранять человечность и подлинность в эпоху стремительных технологических изменений.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coffee Break */}
            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-warning/15 text-warning font-bold px-4 py-2 rounded-lg text-sm">
                    19:40-19:50
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Кофе-пауза</h3>
                    <p className="text-muted-foreground">Небольшой перерыв, время для общения и обмена впечатлениями</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dima Utlik */}
            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg text-sm">
                    19:50-20:20
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {speakers.find(s => s.name === "Алекс Шкор")?.image ? (
                        <img
                          src={speakers.find(s => s.name === "Алекс Шкор")?.image}
                          alt="Алекс Шкор"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          АШ
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">Алекс Шкор</h3>
                        <p className="text-sm text-muted-foreground">ИИ архитектор, CEO Collective Intelligence Labs</p>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-primary mb-3">«Принимаем роды у ИИ»</h4>
                    <p className="text-muted-foreground">
                      Мы станем цифровыми акушерами. Прямо на ИИшнице мы зачнем, выносим и запустим нового ИИ-агента. А по пути поймем, почему умение «принимать роды у ИИ» — это скилл номер один для любого специалиста.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Networking 2 */}
            <Card className="border border-white/[0.08] bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg text-sm">
                    20:20-21:00
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Нетворкинг</h3>
                    <p className="text-muted-foreground">Завершающее общение, обмен контактами, обсуждение услышанного</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Location Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              <span className="gradient-text">Место</span> проведения
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Пространство Бетон
            </p>
            <div className="flex items-center justify-center text-muted-foreground">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Минск, Кальварийская ул., 17</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <EventLocationMap />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDecember18;
