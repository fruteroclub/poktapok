/**
 * Major cities by country for profile location selection
 * Organized by ISO 3166-1 alpha-2 country codes
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  AR: [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'San Miguel de Tucumán',
    'Mar del Plata',
    'Salta',
  ],
  BO: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro'],
  BR: [
    'São Paulo',
    'Rio de Janeiro',
    'Brasília',
    'Salvador',
    'Fortaleza',
    'Belo Horizonte',
    'Manaus',
    'Curitiba',
    'Recife',
    'Porto Alegre',
  ],
  CL: [
    'Santiago',
    'Valparaíso',
    'Concepción',
    'La Serena',
    'Antofagasta',
    'Temuco',
    'Rancagua',
    'Talca',
  ],
  CO: [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Cúcuta',
    'Bucaramanga',
    'Pereira',
  ],
  CR: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Puntarenas', 'Limón'],
  CU: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'],
  DO: [
    'Santo Domingo',
    'Santiago de los Caballeros',
    'La Romana',
    'San Pedro de Macorís',
    'Puerto Plata',
  ],
  EC: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta'],
  SV: ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Santa Tecla'],
  GT: ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla'],
  HN: ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso'],
  MX: [
    'Ciudad de México',
    'Guadalajara',
    'Monterrey',
    'Puebla',
    'Tijuana',
    'León',
    'Juárez',
    'Zapopan',
    'Mérida',
    'Querétaro',
  ],
  NI: ['Managua', 'León', 'Masaya', 'Matagalpa', 'Chinandega', 'Estelí'],
  PA: ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Colón'],
  PY: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá'],
  PE: [
    'Lima',
    'Arequipa',
    'Trujillo',
    'Chiclayo',
    'Cusco',
    'Piura',
    'Iquitos',
    'Huancayo',
  ],
  PR: ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas', 'Mayagüez'],
  UY: ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado'],
  VE: [
    'Caracas',
    'Maracaibo',
    'Valencia',
    'Barquisimeto',
    'Maracay',
    'Ciudad Guayana',
    'Barcelona',
    'Maturín',
  ],
}

/**
 * Get list of cities for a given country code
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Array of city names, or empty array if country not found
 */
export function getCitiesByCountry(countryCode: string): string[] {
  return CITIES_BY_COUNTRY[countryCode] || []
}
