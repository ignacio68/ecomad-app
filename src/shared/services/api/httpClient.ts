const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string

// Tipos para las respuestas
interface ApiResponse<T> {
	success: boolean
	message: string
	data: T
	statusCode: number
}

interface ApiError {
	success: boolean
	message: string
	data: null
	statusCode: number
}

// Configuración por defecto
const defaultHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
}

// Cliente HTTP principal
class HttpClient {
	private readonly baseURL: string

	constructor(baseURL: string = BASE_URL) {
		this.baseURL = baseURL
	}

	// Método genérico para hacer requests
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`

		const config: RequestInit = {
			headers: {
				...defaultHeaders,
				...options.headers,
			},
			...options,
		}

		try {
			console.log(`🌐 HTTP Request: ${config.method || 'GET'} ${url}`)

			const response = await fetch(url, config)
			const data = await response.json()

			console.log(`✅ HTTP Response: ${response.status} ${url}`)
			// console.log(`📦 Response data:`, data)

			const result = {
				success: data.success ?? response.ok,
				message: data.message || 'Request completed',
				data: data.data || data,
				statusCode: data.statusCode || response.status,
			}

			// console.log(`📋 Parsed result:`, result)
			return result
		} catch (error) {
			console.error(`❌ HTTP Error: ${url}`, error)

			return {
				success: false,
				message: error instanceof Error ? error.message : 'Network error',
				data: null as T,
				statusCode: 500,
			}
		}
	}

	// Métodos HTTP
	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: 'GET' })
	}

	async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		})
	}

	async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
		})
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: 'DELETE' })
	}
}

// Instancia exportada
export const httpClient = new HttpClient()

// Exportar tipos
export type { ApiError, ApiResponse }
