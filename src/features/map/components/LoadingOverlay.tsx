import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

interface LoadingOverlayProps {
	isLoading: boolean
	message?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(
	({ isLoading, message = 'Cargando datos...' }) => {
		if (!isLoading) return null

		return (
			<View
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 1000,
				}}
			>
				<View
					style={{
						backgroundColor: 'white',
						padding: 20,
						borderRadius: 10,
						alignItems: 'center',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
					}}
				>
					<ActivityIndicator size="large" color="#3B82F6" />
					<Text
						style={{
							marginTop: 10,
							fontSize: 16,
							color: '#374151',
							textAlign: 'center',
						}}
					>
						{message}
					</Text>
				</View>
			</View>
		)
	},
)

LoadingOverlay.displayName = 'LoadingOverlay'

export default LoadingOverlay
