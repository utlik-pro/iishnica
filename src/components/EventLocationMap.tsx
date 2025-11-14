interface EventLocationMapProps {
  address?: string;
}

const EventLocationMap = ({
  address = "Минск, ул. Ленина 50"
}: EventLocationMapProps) => {
  return (
    <div className="w-full h-[450px] rounded-lg overflow-hidden shadow-sm border border-purple-100">
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=27.576148%2C53.889800&z=17&pt=27.576148,53.889800,pm2rdm"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen={true}
        style={{ position: 'relative' }}
        title="Яндекс.Карты - Минск, ул. Ленина 50"
      />
    </div>
  );
};

export default EventLocationMap;
