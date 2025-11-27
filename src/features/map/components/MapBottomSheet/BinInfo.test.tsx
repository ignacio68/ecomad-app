import { render, screen } from '@testing-library/react-native'
import BinInfo from './BinInfo'
import type { BinPoint } from '@map/types/mapData'

describe('BinInfo', () => {
	it('should render', () => {
		const bin: BinPoint = {
			type: 'Feature',
			properties: {
				cluster: false,
				binType: 'clothing_bins',
				binId: 'test-bin-123',
				category_group_id: 1,
				category_id: 1,
				district_code: '123',
				neighborhood_code: '123',
				address: '123 Main St',
				lat: 123,
				lng: 123,
			},
			geometry: {
				type: 'Point',
				coordinates: [123, 123],
			},
		}
		render(<BinInfo bin={bin} />)
		expect(screen.getByText('BinInfo')).toBeTruthy()
	})
})
