/**
 * Éphéméride Solaire Pure pour la Côte Basque (Latitude 43.48° N, Longitude -1.56° O)
 * Implémentation algorithmique standard NOAA / Jean Meeus, ultra-légère (zéro dépendance externe).
 */
export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date;  // Aube civile (premières lueurs surfables)
  dusk: Date;  // Crépuscule civil (dernières vagues visibles)
  sunriseHour: number; // ex: 7.42 (07h25)
  sunsetHour: number;  // ex: 21.15 (21h09)
}

const BASQUE_LAT = 43.483;
const BASQUE_LON = -1.560;

/**
 * Calcule les heures solaires pour une date donnée sur la Côte Basque
 */
export function getBasqueSolarTimes(date: Date = new Date()): SolarTimes {
  const startOfDay = new Date(date);
  startOfDay.setHours(12, 0, 0, 0);

  // Jour de l'année (1 à 366)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((startOfDay.getTime() - startOfYear.getTime()) / (24 * 3600 * 1000)) + 1;

  // Déclinaison solaire approximative (Cooper, 1969)
  const b = ((2 * Math.PI) / 365) * (dayOfYear - 81);
  const declination = 23.45 * Math.sin(b) * (Math.PI / 180);

  // Équation du temps (minutes)
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const latRad = BASQUE_LAT * (Math.PI / 180);

  // Angle horaire au lever/coucher (centre du disque solaire à -0.833°)
  const zenithRad = 90.833 * (Math.PI / 180);
  const cosHourAngle = (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngleHours = (Math.acos(clampedCos) * (180 / Math.PI)) / 15;

  // Heure solaire du midi vrai en UTC
  const solarNoonUtc = 12 - (BASQUE_LON * 4) / 60 - eot / 60;

  // Décalage du fuseau horaire local (ex: UTC+1 en hiver, UTC+2 en été en France)
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;

  const sunriseHour = solarNoonUtc - hourAngleHours + timezoneOffsetHours;
  const sunsetHour = solarNoonUtc + hourAngleHours + timezoneOffsetHours;

  // Aube civile (-6° sous l'horizon) : ~30 min avant le lever
  // Crépuscule civil : ~30 min après le coucher
  const dawnHour = Math.max(0, sunriseHour - 0.5);
  const duskHour = Math.min(24, sunsetHour + 0.5);

  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), Math.floor((sunriseHour % 1) * 60), 0, 0);

  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), Math.floor((sunsetHour % 1) * 60), 0, 0);

  const dawn = new Date(date);
  dawn.setHours(Math.floor(dawnHour), Math.floor((dawnHour % 1) * 60), 0, 0);

  const dusk = new Date(date);
  dusk.setHours(Math.floor(duskHour), Math.floor((duskHour % 1) * 60), 0, 0);

  return {
    sunrise,
    sunset,
    dawn,
    dusk,
    sunriseHour,
    sunsetHour
  };
}
