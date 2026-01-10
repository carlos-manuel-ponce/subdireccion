import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Calendar as CalendarIcon, Target, LogOut, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import logoUrl from "@assets/LOGO_BLANCO_1767308770849.png";
import type { JuntasEvento, JuntasObjetivo } from "@shared/schema";

type TabType = "calendario" | "objetivos";

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Amarillo" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#ec4899", label: "Rosa" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "text-amber-400",
  EN_PROGRESO: "text-blue-400",
  COMPLETADA: "text-emerald-400",
  CANCELADA: "text-red-400",
  ACTIVO: "text-blue-400",
  COMPLETADO: "text-emerald-400",
  PAUSADO: "text-amber-400",
  PLANIFICACION: "text-violet-400",
  EN_CURSO: "text-blue-400",
  SUSPENDIDO: "text-red-400",
};

export default function JuntasLayout() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/juntas/:tab");
  const [activeTab, setActiveTab] = useState<TabType>("calendario");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isObjetivoDialogOpen, setIsObjetivoDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const authModule = localStorage.getItem("authModule");
    if (authModule !== "JUNTAS") {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (match && params?.tab) {
      const tab = params.tab as TabType;
      if (["calendario", "objetivos"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [match, params]);

  const { data: eventos = [] } = useQuery<JuntasEvento[]>({
    queryKey: ["/api/juntas/eventos"],
  });

  const { data: objetivos = [] } = useQuery<JuntasObjetivo[]>({
    queryKey: ["/api/juntas/objetivos"],
  });

  const createEventoMutation = useMutation({
    mutationFn: async (data: Partial<JuntasEvento>) => {
      const response = await apiRequest("POST", "/api/juntas/eventos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/juntas/eventos"] });
      setIsEventDialogOpen(false);
      toast({ title: "Evento creado", description: "El evento se agregó al calendario" });
    },
  });

  const createObjetivoMutation = useMutation({
    mutationFn: async (data: Partial<JuntasObjetivo>) => {
      const response = await apiRequest("POST", "/api/juntas/objetivos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/juntas/objetivos"] });
      setIsObjetivoDialogOpen(false);
      toast({ title: "Objetivo creado", description: "El objetivo fue agregado" });
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setLocation(`/juntas/${value}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authModule");
    localStorage.removeItem("authUserName");
    setLocation("/");
  };

  const currentUserName = localStorage.getItem("authUserName") || "Usuario";

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const eventosDelDia = eventos.filter(e => e.fecha === formatDate(selectedDate));

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  };

  const monthDays = getMonthDays(currentMonth);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedDate);

  const stats = {
    eventosHoy: eventos.filter(e => e.fecha === formatDate(new Date())).length,
    eventosSemana: eventos.filter(e => {
      const eventDate = new Date(e.fecha);
      return weekDates.some(d => formatDate(d) === formatDate(eventDate));
    }).length,
    objetivosActivos: objetivos.filter(o => o.estado === "ACTIVO").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-juntas-title">
              JUNTAS DE CLASIFICACIÓN
            </h1>
            <p className="text-sm text-muted-foreground">ORGANIZACIÓN</p>
          </div>
          <div className="flex-1 flex justify-center">
            <img 
              src={logoUrl} 
              alt="Gobierno de la Provincia - Ministerio de Educación" 
              className="h-10"
              data-testid="img-logo"
            />
          </div>
          <div className="flex-1 flex justify-end items-center gap-3">
            <span className="text-sm text-muted-foreground" data-testid="text-current-user">{currentUserName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Eventos Hoy</p>
                <p className="text-2xl font-bold text-blue-400" data-testid="stat-eventos-hoy">{stats.eventosHoy}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-violet-500/10">
                <CalendarIcon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-violet-400" data-testid="stat-eventos-semana">{stats.eventosSemana}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-500/10">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Objetivos Activos</p>
                <p className="text-2xl font-bold text-emerald-400" data-testid="stat-objetivos">{stats.objetivosActivos}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="calendario" data-testid="tab-calendario">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="objetivos" data-testid="tab-objetivos">
              <Target className="mr-2 h-4 w-4" />
              Objetivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-xl font-bold text-foreground min-w-[200px] text-center">
                    {currentMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" }).toUpperCase()}
                  </h3>
                  <Button variant="outline" size="icon" onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-event">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Evento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createEventoMutation.mutate({
                        titulo: formData.get("titulo") as string,
                        descripcion: formData.get("descripcion") as string,
                        fecha: formData.get("fecha") as string,
                        horaInicio: formData.get("horaInicio") as string,
                        horaFin: formData.get("horaFin") as string,
                        color: formData.get("color") as string,
                        estado: "PENDIENTE",
                      });
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título</Label>
                        <Input id="titulo" name="titulo" required data-testid="input-event-titulo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" name="descripcion" data-testid="input-event-descripcion" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fecha">Fecha</Label>
                          <Input id="fecha" name="fecha" type="date" defaultValue={formatDate(selectedDate)} required data-testid="input-event-fecha" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Select name="color" defaultValue="#3b82f6">
                            <SelectTrigger data-testid="select-event-color">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COLORS.map(c => (
                                <SelectItem key={c.value} value={c.value}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                                    {c.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="horaInicio">Hora Inicio</Label>
                          <Input id="horaInicio" name="horaInicio" type="time" data-testid="input-event-hora-inicio" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="horaFin">Hora Fin</Label>
                          <Input id="horaFin" name="horaFin" type="time" data-testid="input-event-hora-fin" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={createEventoMutation.isPending} data-testid="button-submit-event">
                        {createEventoMutation.isPending ? "Guardando..." : "Guardar Evento"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="aspect-square bg-muted/20 rounded-md" />;
                  }
                  const dayEvents = eventos.filter(e => e.fecha === formatDate(date));
                  const isToday = formatDate(date) === formatDate(new Date());
                  const isSelected = formatDate(date) === formatDate(selectedDate);
                  const hasEvents = dayEvents.length > 0;
                  const eventColor = hasEvents ? dayEvents[0].color : null;
                  
                  return (
                    <div
                      key={formatDate(date)}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-2 rounded-md cursor-pointer transition-all hover-elevate flex flex-col ${
                        isSelected ? "ring-2 ring-primary" : ""
                      } ${isToday ? "bg-primary/20" : hasEvents ? "bg-muted/50" : "bg-muted/20"}`}
                      style={hasEvents ? { borderLeft: `4px solid ${eventColor}` } : {}}
                      data-testid={`calendar-day-${formatDate(date)}`}
                    >
                      <span className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                        {date.getDate()}
                      </span>
                      {hasEvents && (
                        <div className="flex-1 flex flex-col justify-end">
                          <div className="flex gap-1 flex-wrap">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <div 
                                key={i} 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: e.color }}
                                title={e.titulo}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{dayEvents.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Eventos del {selectedDate.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {eventosDelDia.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay eventos programados para este día</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eventosDelDia.map(evento => (
                    <div key={evento.id} className="p-4 rounded-md bg-muted/30 border-l-4" style={{ borderLeftColor: evento.color }}>
                      <h4 className="font-semibold text-foreground">{evento.titulo}</h4>
                      {evento.horaInicio && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {evento.horaInicio} - {evento.horaFin || "Sin hora fin"}
                        </p>
                      )}
                      {evento.descripcion && (
                        <p className="text-sm text-muted-foreground mt-2">{evento.descripcion}</p>
                      )}
                      <Badge variant="outline" className={`mt-3 ${STATUS_COLORS[evento.estado]}`}>
                        {evento.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="objetivos">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Objetivos</h3>
                <Dialog open={isObjetivoDialogOpen} onOpenChange={setIsObjetivoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-objetivo">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Objetivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Objetivo</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createObjetivoMutation.mutate({
                        titulo: formData.get("titulo") as string,
                        descripcion: formData.get("descripcion") as string,
                        fechaLimite: formData.get("fechaLimite") as string,
                        progreso: 0,
                        estado: "ACTIVO",
                      });
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título</Label>
                        <Input id="titulo" name="titulo" required data-testid="input-objetivo-titulo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" name="descripcion" data-testid="input-objetivo-descripcion" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaLimite">Fecha Límite</Label>
                        <Input id="fechaLimite" name="fechaLimite" type="date" data-testid="input-objetivo-fecha" />
                      </div>
                      <Button type="submit" className="w-full" disabled={createObjetivoMutation.isPending} data-testid="button-submit-objetivo">
                        {createObjetivoMutation.isPending ? "Guardando..." : "Guardar Objetivo"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objetivos.map(objetivo => (
                  <Card key={objetivo.id} className="p-4 hover-elevate" data-testid={`card-objetivo-${objetivo.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{objetivo.titulo}</h4>
                      <Badge variant="outline" className={STATUS_COLORS[objetivo.estado]}>{objetivo.estado}</Badge>
                    </div>
                    {objetivo.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3">{objetivo.descripcion}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium text-emerald-400">{objetivo.progreso}%</span>
                      </div>
                      <Progress value={objetivo.progreso} className="h-2" />
                    </div>
                    {objetivo.fechaLimite && (
                      <p className="text-xs text-muted-foreground mt-3">Fecha límite: {objetivo.fechaLimite}</p>
                    )}
                  </Card>
                ))}
                {objetivos.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">No hay objetivos registrados</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-card border-t border-border py-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Desarrollado por Dirección Gestión Educativa
          </p>
        </div>
      </footer>
    </div>
  );
}
