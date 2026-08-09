import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { PatientForm } from '@/components/booking/PatientForm'

// El componente importa obrasSocialesApi desde su módulo directo y pacientesApi
// desde el barrel. Hay que mockear los dos: si sólo se mockea el barrel, la
// carga de obras sociales sale a la red de verdad durante los tests.
vi.mock('@/api/obras-sociales', () => ({
  obrasSocialesApi: {
    listar: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('@/api', () => ({
  pacientesApi: {
    buscarPorDocumento: vi.fn().mockResolvedValue(null),
  },
}))

/** Deja el formulario en modo "paciente nuevo", que es donde viven los campos. */
const abrirFormularioNuevo = () => {
  fireEvent.click(screen.getByRole('button', { name: /Primera vez/i }))
}

/** Completa el mínimo que exige validateForm(). */
const completarCamposObligatorios = () => {
  fireEvent.change(screen.getByLabelText(/^Nombre Completo/), {
    target: { value: 'Ana Gómez' },
  })
  fireEvent.change(screen.getByLabelText(/^DNI/), {
    target: { value: '30111222' },
  })
  fireEvent.change(screen.getByLabelText(/^Fecha de Nacimiento/), {
    target: { value: '1990-05-14' },
  })
  // Anclado al inicio: "Teléfono de Emergencia" también contiene "Teléfono".
  fireEvent.change(screen.getByLabelText(/^Teléfono \*/), {
    target: { value: '1155667788' },
  })
  fireEvent.change(screen.getByLabelText(/^E-mail/), {
    target: { value: 'ana@ejemplo.com' },
  })
}

describe('PatientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // El componente cachea los datos en localStorage y los relee al montar,
    // así que sin esto un test arrastra el estado del anterior.
    localStorage.clear()
  })

  it('arranca preguntando si el paciente ya se atendió antes', () => {
    render(<PatientForm onPatientData={() => {}} />)

    expect(screen.getByText('¿Ya te atendiste con nosotros?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ya soy paciente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Primera vez/i })).toBeInTheDocument()
  })

  it('"Primera vez" abre el formulario de datos personales', () => {
    render(<PatientForm onPatientData={() => {}} />)
    abrirFormularioNuevo()

    expect(screen.getByText('Información Personal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirmar Datos/i })).toBeInTheDocument()
  })

  it('"Ya soy paciente" abre la búsqueda por DNI', () => {
    render(<PatientForm onPatientData={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Ya soy paciente/i }))

    expect(screen.getByText('Buscar por DNI')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingresá tu DNI')).toBeInTheDocument()
  })

  it('marca los campos vacíos y no entrega datos al enviar en blanco', async () => {
    const onPatientData = vi.fn()
    render(<PatientForm onPatientData={onPatientData} embedded />)
    abrirFormularioNuevo()

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Datos/i }))

    await waitFor(() => {
      // Nombre, DNI, fecha, teléfono y email: cinco campos obligatorios.
      expect(screen.getAllByText('Requerido')).toHaveLength(5)
    })
    expect(onPatientData).not.toHaveBeenCalled()
  })

  it('exige nombre y apellido, no sólo un nombre suelto', async () => {
    const onPatientData = vi.fn()
    render(<PatientForm onPatientData={onPatientData} embedded />)
    abrirFormularioNuevo()

    completarCamposObligatorios()
    fireEvent.change(screen.getByLabelText(/^Nombre Completo/), {
      target: { value: 'Ana' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Datos/i }))

    await waitFor(() => {
      expect(screen.getByText('Ingrese nombre y apellido')).toBeInTheDocument()
    })
    expect(onPatientData).not.toHaveBeenCalled()
  })

  it('rechaza un email mal formado', async () => {
    const onPatientData = vi.fn()
    render(<PatientForm onPatientData={onPatientData} embedded />)
    abrirFormularioNuevo()

    completarCamposObligatorios()
    fireEvent.change(screen.getByLabelText(/^E-mail/), {
      target: { value: 'ana@sin-tld' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Datos/i }))

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
    expect(onPatientData).not.toHaveBeenCalled()
  })

  it('entrega los datos separando nombre de apellido', async () => {
    const onPatientData = vi.fn()
    render(<PatientForm onPatientData={onPatientData} embedded />)
    abrirFormularioNuevo()

    completarCamposObligatorios()
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Datos/i }))

    await waitFor(() => {
      expect(onPatientData).toHaveBeenCalledTimes(1)
    })
    expect(onPatientData).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ana',
        apellido: 'Gómez',
        numero_documento: '30111222',
        tipo_documento: 'DNI',
        email: 'ana@ejemplo.com',
      })
    )
  })

  it('toma todos los apellidos cuando el nombre tiene más de dos palabras', async () => {
    const onPatientData = vi.fn()
    render(<PatientForm onPatientData={onPatientData} embedded />)
    abrirFormularioNuevo()

    completarCamposObligatorios()
    fireEvent.change(screen.getByLabelText(/^Nombre Completo/), {
      target: { value: 'Ana María Gómez Pérez' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Datos/i }))

    await waitFor(() => {
      expect(onPatientData).toHaveBeenCalledTimes(1)
    })
    expect(onPatientData).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ana',
        apellido: 'María Gómez Pérez',
      })
    )
  })
})
