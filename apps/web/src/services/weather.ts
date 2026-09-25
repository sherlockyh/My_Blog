/** open-meteo 地理编码响应（仅声明用到的字段） */
interface GeoResponse {
  results?: { latitude: number; longitude: number }[];
}

/** open-meteo 实况天气响应（仅声明用到的字段） */
interface ForecastResponse {
  current?: { temperature_2m?: number; is_day?: number };
}

export interface WeatherSummary {
  temp: number;
  isDay: boolean;
}

/**
 * 首页天气胶囊数据源：open-meteo 免 key 接口，先地理编码再查实况。
 * 失败向上抛出，由调用方决定静默隐藏或提示。
 */
export async function fetchWeather(city: string): Promise<WeatherSummary | null> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  );
  const geo = (await geoRes.json()) as GeoResponse;
  const place = geo.results?.[0];
  if (!place) return null;

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,is_day`,
  );
  const data = (await res.json()) as ForecastResponse;
  return {
    temp: Math.round(data.current?.temperature_2m ?? 0),
    isDay: data.current?.is_day === 1,
  };
}
