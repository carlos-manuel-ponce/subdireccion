import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type CoberturaRegistro, REGION_NIVEL_TYPES, RESPONSABLE_TYPES } from "@shared/schema";

const formSchema = z.object({
  llamado: z.string().min(1, "Ingrese el número de llamado"),
  regionNivel: z.string().min(1, "Seleccione una región y nivel"),
  responsable: z.string().min(1, "Seleccione un responsable"),
  expediente: z.string().min(1, "Ingrese el número de expediente"),
});

type FormData = z.infer<typeof formSchema>;

interface RegistroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: CoberturaRegistro | null;
  onSubmit: (formData: globalThis.FormData) => void;
  isPending: boolean;
}

export function RegistroDialog({ open, onOpenChange, registro, onSubmit, isPending }: RegistroDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keepExistingFile, setKeepExistingFile] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      llamado: "",
      regionNivel: "",
      responsable: "",
      expediente: "",
    },
  });

  useEffect(() => {
    if (registro) {
      form.reset({
        llamado: registro.llamado,
        regionNivel: registro.regionNivel,
        responsable: registro.responsable,
        expediente: registro.expediente,
      });
      setKeepExistingFile(!!registro.pedidoFileName);
    } else {
      form.reset({
        llamado: "",
        regionNivel: "",
        responsable: "",
        expediente: "",
      });
      setKeepExistingFile(false);
    }
    setSelectedFile(null);
  }, [registro, form, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        form.setError("expediente", { message: "Solo se permiten archivos Word (.doc, .docx)" });
        return;
      }
      setSelectedFile(file);
      setKeepExistingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setKeepExistingFile(false);
  };

  const handleSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append("llamado", data.llamado);
    formData.append("regionNivel", data.regionNivel);
    formData.append("responsable", data.responsable);
    formData.append("expediente", data.expediente);
    
    if (selectedFile) {
      formData.append("pedido", selectedFile);
    } else if (keepExistingFile && registro?.pedidoFileName) {
      formData.append("keepFile", "true");
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{registro ? "Editar Registro" : "Nuevo Registro"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="llamado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Llamado</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el número de llamado"
                      data-testid="input-llamado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regionNivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Región y Nivel</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-region-nivel">
                        <SelectValue placeholder="Seleccione región y nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGION_NIVEL_TYPES.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-responsable">
                        <SelectValue placeholder="Seleccione un responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESPONSABLE_TYPES.map((responsable) => (
                        <SelectItem key={responsable} value={responsable}>{responsable}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expediente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expediente</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: 1234567/26" 
                      {...field} 
                      data-testid="input-expediente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Pedido (archivo Word)</FormLabel>
              {selectedFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : keepExistingFile && registro?.pedidoFileName ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{registro.pedidoFileName}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Haga clic para subir archivo</span>
                  <span className="text-xs text-muted-foreground/70">.doc, .docx</span>
                  <input
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-file"
                  />
                </label>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-registro">
                {isPending ? "Guardando..." : registro ? "Guardar Cambios" : "Crear Registro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
