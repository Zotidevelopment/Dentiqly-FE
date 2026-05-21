import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ServiceSelection } from '@/components/booking/ServiceSelection'
import { serviciosApi } from '@/api/servicios'

vi.mock('@/api/servicios', () => ({
  serviciosApi: {
    listar: vi.fn()
  }
}))

const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}))

const mockServices = [
  { id: 1, nombre: 'Limpieza Dental', descripcion: 'Limpieza completa', duracion_estimada: 60, categoria: 'Preventivo', precio_base: 5000 },
  { id: 2, nombre: 'Ortodoncia', descripcion: 'Tratamiento de ortodoncia', duracion_estimada: 120, categoria: 'Ortodoncia', precio_base: 50000 }
]

describe('ServiceSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(serviciosApi.listar).mockReturnValue(new Promise(() => {}))
    render(<ServiceSelection selectedService={null} onServiceSelect={() => {}} />)
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(5)
  })

  it('should render services after loading', async () => {
    vi.mocked(serviciosApi.listar).mockResolvedValue({ data: mockServices } as any)

    render(<ServiceSelection selectedService={null} onServiceSelect={() => {}} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Limpieza Dental' })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Ortodoncia' })).toBeInTheDocument()
  })

  it('should call onServiceSelect when clicking a service', async () => {
    vi.mocked(serviciosApi.listar).mockResolvedValue({ data: mockServices } as any)
    const onSelect = vi.fn()

    render(<ServiceSelection selectedService={null} onServiceSelect={onSelect} />)

    await waitFor(() => {
      screen.getByRole('heading', { name: 'Limpieza Dental' }).closest('div')?.click()
    })

    expect(onSelect).toHaveBeenCalledWith(mockServices[0])
  })

  it('should call toast when API fails', async () => {
    vi.mocked(serviciosApi.listar).mockRejectedValue(new Error('API Error'))

    render(<ServiceSelection selectedService={null} onServiceSelect={() => {}} />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los servicios disponibles"
      })
    })
  })
})
