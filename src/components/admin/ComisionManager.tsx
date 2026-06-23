"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { liquidacionesApi } from "../../api/liquidaciones"
import { profesionalesApi } from "../../api/profesionales"
import type { Profesional } from "../../types"
import { Spinner } from "../../components/ui/spinner"
import { useToast } from "../../hooks/use-toast"

export function ComisionManager() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedProfesional, setSelectedProfesional] = useState<Profesional | null>(null)
  const [comision, setComision] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    cargarProfesionales()
  }, [])

  const cargarProfesionales = async () => {
    try {
      setLoading(true)
      const response = await profesionalesApi.listar({ estado: "Activo" })
      setProfesionales(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los profesionales",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditComision = (profesional: Profesional) => {
    setSelectedProfesional(profesional)
    setComision(profesional.porcentaje_comision?.toString() || "50")
    setShowEditDialog(true)
  }

  const handleSaveComision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfesional) return

    try {
      await liquidacionesApi.actualizarComision(selectedProfesional.id, {
        porcentaje_comision: Number(comision),
      })
      toast({
        title: "Éxito",
        description: "Comisión actualizada correctamente",
      })
      setShowEditDialog(false)
      cargarProfesionales()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la comisión",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 font-sans space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comisiones</h1>
          <p className="text-gray-500 mt-1">Configurar porcentajes de comisión por profesional</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profesionales</CardTitle>
          <CardDescription>Gestionar el porcentaje de comisión de cada profesional</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Comisión (%)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profesionales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay profesionales registrados
                  </TableCell>
                </TableRow>
              ) : (
                profesionales.map((profesional) => (
                  <TableRow key={profesional.id}>
                    <TableCell>{profesional.id}</TableCell>
                    <TableCell>
                      {profesional.nombre} {profesional.apellido}
                    </TableCell>
                    <TableCell>{profesional.especialidad}</TableCell>
                    <TableCell>{profesional.porcentaje_comision || 50}%</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleEditComision(profesional)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comisión</DialogTitle>
            <DialogDescription>
              {selectedProfesional?.nombre} {selectedProfesional?.apellido}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveComision}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comision">Porcentaje de Comisión (%) *</Label>
                <Input
                  id="comision"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={comision}
                  onChange={(e) => setComision(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Este profesional recibirá el {comision}% del monto total de cada prestación
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

