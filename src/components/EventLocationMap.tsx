interface EventLocationMapProps {
  address?: string;
}

const EventLocationMap = ({
  address = "Минск, Кальварийская ул., 17"
}: EventLocationMapProps) => {
  return (
    <div className="w-full h-[450px] rounded-lg overflow-hidden shadow-sm border border-purple-100">
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=27.529474%2C53.905912&z=17&pt=27.529474,53.905912,pm2rdm"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen={true}
        style={{ position: 'relative' }}
        title="Яндекс.Карты - Минск, Кальварийская ул., 17"
      />
    </div>
  );
};

export default EventLocationMap;
