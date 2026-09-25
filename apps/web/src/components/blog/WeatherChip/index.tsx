// 组件用途：展示首页天气摘要信息。
import { CloudOutlined, SunOutlined } from '@ant-design/icons';
import { useSiteStore } from '@/store/site';
import { useRequest } from '@/hooks/useRequest';
import { fetchWeather } from '@/services/weather';

/** 首页天气胶囊：open-meteo 免 key 接口，失败或无结果时静默隐藏 */
export default function WeatherChip() {
  const city = useSiteStore((s) => s.site?.config.weatherCity) || 'Hangzhou';
  const { data: weather } = useRequest(() => fetchWeather(city), { refreshDeps: [city] });

  if (!weather) return null;
  return (
    <span className="pill-btn weather">
      {weather.isDay ? <SunOutlined /> : <CloudOutlined />}
      {city} {weather.temp}°C
    </span>
  );
}
