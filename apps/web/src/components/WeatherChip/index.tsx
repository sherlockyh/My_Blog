// 组件用途：展示首页天气摘要信息。
import { useEffect, useState } from 'react';
import { CloudOutlined, SunOutlined } from '@ant-design/icons';
import { useSiteStore } from '@/store/site';

interface Weather {
  temp: number;
  isDay: boolean;
}

/** 首页天气胶囊：open-meteo 免 key 接口 */
export default function WeatherChip() {
  const city = useSiteStore((s) => s.site?.config.weatherCity) || 'Hangzhou';
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
        );
        const geo = await geoRes.json();
        const place = geo?.results?.[0];
        if (!place) return;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,is_day`,
        );
        const data = await res.json();
        if (!cancelled) {
          setWeather({
            temp: Math.round(data?.current?.temperature_2m ?? 0),
            isDay: data?.current?.is_day === 1,
          });
        }
      } catch {
        /* 天气获取失败时静默隐藏 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (!weather) return null;
  return (
    <span className="pill-btn weather">
      {weather.isDay ? <SunOutlined /> : <CloudOutlined />}
      {city} {weather.temp}°C
    </span>
  );
}
