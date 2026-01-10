import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import CreacionesHome from "@/pages/creaciones";
import CoberturaLayout from "@/pages/cobertura/layout";
import TitularizacionesLayout from "@/pages/titularizaciones/layout";
import InformesLayout from "@/pages/informes/layout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/creaciones" component={CreacionesHome} />
      <Route path="/cobertura" component={CoberturaLayout} />
      <Route path="/cobertura/:tab" component={CoberturaLayout} />
      <Route path="/titularizaciones" component={TitularizacionesLayout} />
      <Route path="/titularizaciones/:tab" component={TitularizacionesLayout} />
      <Route path="/informes" component={InformesLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
