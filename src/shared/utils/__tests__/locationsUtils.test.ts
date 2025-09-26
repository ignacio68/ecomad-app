// Jest ya incluye describe, expect, it globalmente
import {
	getAllNeighborhoodNames,
	getDistrictByNeighborhood,
	getDistrictNames,
	getNeighborhoodNames,
	isValidDistrictName,
	isValidNeighborhoodName,
	normalizeDistrictName,
	normalizeLocationName,
	normalizeNeighborhoodName,
} from '../locationsUtils'

describe('districtUtils', () => {
	describe('getDistrictNames', () => {
		it('should return all district names', () => {
			const districts = getDistrictNames()
			expect(districts).toContain('Centro')
			expect(districts).toContain('Arganzuela')
			expect(districts).toContain('Chamartín')
			expect(districts.length).toBeGreaterThan(0)
		})
	})

	describe('getNeighborhoodNames', () => {
		it('should return neighborhoods for Centro district', () => {
			const neighborhoods = getNeighborhoodNames('Centro')
			expect(neighborhoods).toContain('Palacio')
			expect(neighborhoods).toContain('Embajadores')
			expect(neighborhoods).toContain('Cortes')
		})

		it('should return empty array for invalid district', () => {
			const neighborhoods = getNeighborhoodNames('Invalid District' as any)
			expect(neighborhoods).toEqual([])
		})
	})

	describe('getAllNeighborhoodNames', () => {
		it('should return all neighborhood names', () => {
			const neighborhoods = getAllNeighborhoodNames()
			expect(neighborhoods).toContain('Palacio')
			expect(neighborhoods).toContain('El Viso')
			expect(neighborhoods.length).toBeGreaterThan(0)
		})
	})

	describe('normalizeLocationName', () => {
		it('should trim whitespace', () => {
			expect(normalizeLocationName('  Centro  ')).toBe('CENTRO')
			expect(normalizeLocationName('\tChamartín\n')).toBe('CHAMARTIN')
		})

		it('should remove accents and convert to uppercase', () => {
			expect(normalizeLocationName('Chamartín')).toBe('CHAMARTIN')
			expect(normalizeLocationName('Fuencarral - El Pardo')).toBe(
				'FUENCARRAL - EL PARDO',
			)
			expect(normalizeLocationName('Ciudad Lineal')).toBe('CIUDAD LINEAL')
			expect(normalizeLocationName('Villa de Vallecas')).toBe(
				'VILLA DE VALLECAS',
			)
		})

		it('should handle complex cases', () => {
			expect(normalizeLocationName('  Chamartín  ')).toBe('CHAMARTIN')
			expect(normalizeLocationName('Fuencarral - El Pardo')).toBe(
				'FUENCARRAL - EL PARDO',
			)
			expect(normalizeLocationName('San Blas - Canillejas')).toBe(
				'SAN BLAS - CANILLEJAS',
			)
		})
	})

	describe('normalizeDistrictName', () => {
		it('should convert district name using normalizeLocationName', () => {
			expect(normalizeDistrictName('Centro')).toBe('CENTRO')
			expect(normalizeDistrictName('Chamartín')).toBe('CHAMARTIN')
		})
	})

	describe('normalizeNeighborhoodName', () => {
		it('should convert neighborhood name using normalizeLocationName', () => {
			expect(normalizeNeighborhoodName('Palacio')).toBe('PALACIO')
			expect(normalizeNeighborhoodName('El Viso')).toBe('EL VISO')
			expect(normalizeNeighborhoodName('Chueca')).toBe('CHUECA')
		})
	})

	describe('isValidDistrictName', () => {
		it('should return true for valid district names', () => {
			expect(isValidDistrictName('Centro')).toBe(true)
			expect(isValidDistrictName('Arganzuela')).toBe(true)
		})

		it('should return false for invalid district names', () => {
			expect(isValidDistrictName('Invalid District')).toBe(false)
			expect(isValidDistrictName('')).toBe(false)
		})
	})

	describe('isValidNeighborhoodName', () => {
		it('should return true for valid neighborhood names', () => {
			expect(isValidNeighborhoodName('Palacio')).toBe(true)
			expect(isValidNeighborhoodName('El Viso')).toBe(true)
		})

		it('should return false for invalid neighborhood names', () => {
			expect(isValidNeighborhoodName('Invalid Neighborhood')).toBe(false)
			expect(isValidNeighborhoodName('')).toBe(false)
		})
	})

	describe('getDistrictByNeighborhood', () => {
		it('should return the correct district for a neighborhood', () => {
			expect(getDistrictByNeighborhood('Palacio')).toBe('Centro')
			expect(getDistrictByNeighborhood('El Viso')).toBe('Chamartín')
		})

		it('should return null for invalid neighborhood', () => {
			expect(getDistrictByNeighborhood('Invalid Neighborhood' as any)).toBe(
				null,
			)
		})
	})
})
