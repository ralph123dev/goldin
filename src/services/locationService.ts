import { CountryInfo } from '../types';

export const getUserCountryInfo = async (): Promise<CountryInfo> => {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    // Table de correspondance code pays -> nom pays
    const countryNames: { [key: string]: string } = {
      FR: 'France',
      US: 'États-Unis',
      CA: 'Canada',
      DE: 'Allemagne',
      IT: 'Italie',
      ES: 'Espagne',
      GB: 'Royaume-Uni',
      MA: 'Maroc',
      DZ: 'Algérie',
      TN: 'Tunisie',
      // ...ajoutez d'autres pays si besoin
    };
    const code = data.country || 'XX';
    return {
      country: countryNames[code] || code,
      country_code: code,
      flag: `https://flagsapi.com/${code}/flat/32.png`
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de localisation:', error);
    return {
      country: 'Unknown',
      country_code: 'XX',
      flag: 'https://flagsapi.com/XX/flat/32.png'
    };
  }
};

export const getCountryFlag = (countryCode: string) => {
  return `https://flagsapi.com/${countryCode}/flat/32.png`;
};