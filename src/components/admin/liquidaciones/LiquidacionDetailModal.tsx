import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../ui/dialog"
import { Button } from "../../ui/Button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table"
import { Trash2, Download } from "lucide-react"
import type { Liquidacion } from "../../../types"

interface LiquidacionDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    liquidacion: Liquidacion | null
    onDelete?: (id: number) => void
    onDownload?: (id: number) => void
}

export function LiquidacionDetailModal({
    open,
    onOpenChange,
    liquidacion,
    onDelete,
    onDownload,
}: LiquidacionDetailModalProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-AR")
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(Number(amount))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                {!liquidacion ? null : (<>
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-[#0B1023]">Liquidación</DialogTitle>
                    {/* Close button is handled by DialogContent usually, but if we need custom one */}
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="font-medium">
                                Miembro: <span className="font-normal uppercase">{liquidacion.profesional?.nombre} {liquidacion.profesional?.apellido}</span>
                            </p>
                            <p className="font-medium">
                                Período: <span className="font-normal">{formatDate(liquidacion.periodo_inicio)} - {formatDate(liquidacion.periodo_fin)}</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {/* Placeholder for payment method if needed */}
                            <div className="text-sm text-gray-500">
                                Forma de pago: {liquidacion.metodo_pago || "Pendiente"}
                            </div>
                            {onDownload && (
                                <Button variant="outline" size="sm" onClick={() => onDownload(liquidacion.id)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    DESCARGAR
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Observaciones */}
                    {liquidacion.observaciones && (
                        <div className="bg-[#2563FF]/5 p-3 rounded-md text-sm border border-[#2563FF]/15">
                            <span className="font-bold text-[#0B1023] block mb-1">Observaciones / Descripción:</span>
                            {liquidacion.observaciones}
                        </div>
                    )}

                    {/* Table */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0B1023] mb-4">Detalle de la liquidación</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Etiquetas</TableHead>
                                        <TableHead>Trabajo</TableHead>
                                        <TableHead className="text-right">Importe ARS ($)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {liquidacion.prestaciones?.map((prestacion: any) => (
                                        <TableRow key={prestacion.id}>
                                            <TableCell>{formatDate(prestacion.fecha)}</TableCell>
                                            <TableCell>
                                                {/* Logic to determine type, e.g. Obra Social or Particular */}
                                                {prestacion.paciente?.obraSocial ? "Obra social" : "Particular"}
                                            </TableCell>
                                            <TableCell className="uppercase">
                                                {prestacion.paciente?.apellido} {prestacion.paciente?.nombre}
                                            </TableCell>
                                            <TableCell>
                                                {/* Placeholder for tags */}
                                                -
                                            </TableCell>
                                            <TableCell>
                                                {prestacion.servicio?.nombre || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(prestacion.monto_profesional)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!liquidacion.prestaciones || liquidacion.prestaciones.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                                No hay detalles disponibles
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between items-center border-t pt-4">
                    <div>
                        {onDelete && (
                            <Button
                                variant="outline"
                                className="border-[#0B1023] text-[#0B1023] hover:bg-[#0B1023] hover:text-white font-bold"
                                onClick={() => onDelete(liquidacion.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ELIMINAR
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            CANCELAR
                        </Button>
                        <Button onClick={() => onOpenChange(false)}>
                            ACEPTAR
                        </Button>
                    </div>
                </DialogFooter>
                </>)}
            </DialogContent>
        </Dialog>
    )
}
