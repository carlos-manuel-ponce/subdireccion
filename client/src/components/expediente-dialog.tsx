import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertExpedienteSchema, UBICACION_TYPES, NIVEL_CREACIONES_TYPES, type InsertExpediente, type Expediente } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ExpedienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expediente?: Expediente | null;
  onSubmit: (data: InsertExpediente) => void;
  isPending: boolean;
}

export function ExpedienteDialog({ open, onOpenChange, expediente, onSubmit, isPending }: ExpedienteDialogProps) {
  const form = useForm<InsertExpediente>({
    resolver: zodResolver(insertExpedienteSchema),
    defaultValues: {
      expediente: "",
      nivel: "",
      solicita: "",
      establecimiento: "",
      ubicacion: UBICACION_TYPES[0],
      comentario: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (expediente) {
        form.reset({
          expediente: expediente.expediente,
          nivel: expediente.nivel || "",
          solicita: expediente.solicita,
          establecimiento: expediente.establecimiento,
          ubicacion: expediente.ubicacion,
          comentario: expediente.comentario || "",
        });
      } else {
        form.reset({
          expediente: "",
          nivel: "",
          solicita: "",
          establecimiento: "",
          ubicacion: UBICACION_TYPES[0],
          comentario: "",
        });
      }
    }
  }, [open, expediente, form]);

  const handleSubmit = (data: InsertExpediente) => {
    onSubmit(data);
  };

  const isEditing = !!expediente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isEditing ? "Editar Expediente" : "Nuevo Expediente"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expediente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expediente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567/26"
                      {...field}
                      data-testid="input-expediente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-nivel">
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIVEL_CREACIONES_TYPES.map((nivel) => (
                        <SelectItem key={nivel} value={nivel} data-testid={`option-nivel-${nivel}`}>
                          {nivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solicita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solicitud</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción de la solicitud"
                      {...field}
                      data-testid="input-solicita"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establecimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Establecimiento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del establecimiento"
                      {...field}
                      data-testid="input-establecimiento"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-ubicacion">
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UBICACION_TYPES.map((ubicacion) => (
                        <SelectItem key={ubicacion} value={ubicacion} data-testid={`option-ubicacion-${ubicacion}`}>
                          {ubicacion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comentario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentario adicional (opcional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="textarea-comentario"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Crear Expediente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
