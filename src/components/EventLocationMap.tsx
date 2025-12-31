interface EventLocationMapProps {
  address?: string;
  yandexMapUrl?: string | null;
}

// Convert Yandex Maps URL to widget URL
const getWidgetUrl = (url: string): string => {
  // If it's already a widget URL, use as is
  if (url.includes('map-widget')) {
    return url;
  }

  // Decode URL to handle encoded characters
  const decodedUrl = decodeURIComponent(url);

  // Try to extract POI point first (most accurate marker position)
  // Format: poi[point]=23.824127,53.711320 or poi%5Bpoint%5D=23.824127%2C53.711320
  const poiMatch = decodedUrl.match(/poi\[point\]=([0-9.]+),([0-9.]+)/);
  if (poiMatch) {
    const lon = poiMatch[1];
    const lat = poiMatch[2];
    return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&pt=${lon},${lat},pm2rdm`;
  }

  // Try to extract from pt parameter
  // Format: ...pt=27.529474,53.905912,pm2rdm...
  const ptMatch = decodedUrl.match(/pt=([0-9.]+),([0-9.]+)/);
  if (ptMatch) {
    const lon = ptMatch[1];
    const lat = ptMatch[2];
    return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&pt=${lon},${lat},pm2rdm`;
  }

  // Try to extract ll (map center) as fallback
  // Format: ...ll=27.529474,53.905912...
  const llMatch = decodedUrl.match(/ll=([0-9.]+),([0-9.]+)/);
  if (llMatch) {
    const lon = llMatch[1];
    const lat = llMatch[2];
    return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&pt=${lon},${lat},pm2rdm`;
  }

  // Default fallback coordinates (Minsk, Kalvariyskaya 17)
  return 'https://yandex.ru/map-widget/v1/?ll=27.529474%2C53.905912&z=17&pt=27.529474,53.905912,pm2rdm';
};

const EventLocationMap = ({
  address = "Минск, Кальварийская ул., 17",
  yandexMapUrl
}: EventLocationMapProps) => {
  const defaultWidgetUrl = 'https://yandex.ru/map-widget/v1/?ll=27.529474%2C53.905912&z=17&pt=27.529474,53.905912,pm2rdm';
  const widgetUrl = yandexMapUrl ? getWidgetUrl(yandexMapUrl) : defaultWidgetUrl;

  return (
    <div className="w-full h-[450px] rounded-lg overflow-hidden shadow-sm border border-purple-100">
      <iframe
        src={widgetUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen={true}
        style={{ position: 'relative' }}
        title={`Яндекс.Карты - ${address}`}
      />
    </div>
  );
};

export default EventLocationMap;
