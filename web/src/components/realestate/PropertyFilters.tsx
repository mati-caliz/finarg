import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCities } from "@/hooks/useCities";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import type { OperationType, PropertyFilter, PropertyType } from "@/types";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface PropertyFiltersProps {
  onFiltersChange: (filters: PropertyFilter | null) => void;
}

export function PropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const { data: cities } = useCities();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const { data: neighborhoods } = useNeighborhoods(selectedCity);

  const [filters, setFilters] = useState<PropertyFilter>({
    cityCode: "",
    currency: "USD",
  });

  useEffect(() => {
    if (cities && cities.length > 0 && filters.cityCode === "") {
      const cabaCity = cities.find((city) => city.code === "caba");
      if (cabaCity) {
        setFilters((prev) => ({ ...prev, cityCode: cabaCity.code }));
        setSelectedCity(cabaCity.code);
      }
    }
  }, [cities, filters.cityCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.cityCode !== "") {
      onFiltersChange(filters);
    }
  };

  const handleReset = () => {
    const defaultFilters: PropertyFilter = {
      cityCode: selectedCity || "",
      currency: "USD",
    };
    setFilters(defaultFilters);
    onFiltersChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Select
              value={filters.cityCode}
              onValueChange={(value: string) => {
                setFilters({ ...filters, cityCode: value, neighborhoodCode: undefined });
                setSelectedCity(value);
              }}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Seleccionar ciudad" />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Barrio (opcional)</Label>
            <Select
              value={filters.neighborhoodCode}
              onValueChange={(value: string) =>
                setFilters({ ...filters, neighborhoodCode: value === "_all" ? undefined : value })
              }
              disabled={!neighborhoods || neighborhoods.length === 0}
            >
              <SelectTrigger id="neighborhood">
                <SelectValue placeholder="Todos los barrios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos los barrios</SelectItem>
                {neighborhoods?.map((neighborhood) => (
                  <SelectItem key={neighborhood.code} value={neighborhood.code}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Tipo de Propiedad</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value: string) =>
                setFilters({
                  ...filters,
                  propertyType: (value === "_all" ? undefined : value) as PropertyType,
                })
              }
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos los tipos</SelectItem>
                <SelectItem value="APARTMENT">Departamento</SelectItem>
                <SelectItem value="HOUSE">Casa</SelectItem>
                <SelectItem value="PH">PH</SelectItem>
                <SelectItem value="LAND">Terreno</SelectItem>
                <SelectItem value="OFFICE">Oficina</SelectItem>
                <SelectItem value="COMMERCIAL">Local Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationType">Operación</Label>
            <Select
              value={filters.operationType}
              onValueChange={(value: string) =>
                setFilters({
                  ...filters,
                  operationType: (value === "_all" ? undefined : value) as OperationType,
                })
              }
            >
              <SelectTrigger id="operationType">
                <SelectValue placeholder="Todas las operaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas las operaciones</SelectItem>
                <SelectItem value="SALE">Venta</SelectItem>
                <SelectItem value="RENT">Alquiler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select
              value={filters.currency || "USD"}
              onValueChange={(value: string) => setFilters({ ...filters, currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portal">Portal</Label>
            <Select
              value={filters.portalSource || "_all"}
              onValueChange={(value: string) =>
                setFilters({ ...filters, portalSource: value === "_all" ? undefined : value })
              }
            >
              <SelectTrigger id="portal">
                <SelectValue placeholder="Todos los portales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos los portales</SelectItem>
                <SelectItem value="argenprop">Argenprop</SelectItem>
                <SelectItem value="zonaprop">Zonaprop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select
              value={filters.sortBy || "_default"}
              onValueChange={(value: string) =>
                setFilters({ ...filters, sortBy: value === "_default" ? undefined : value })
              }
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sin ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_default">Sin ordenar</SelectItem>
                <SelectItem value="price_asc">Menor precio</SelectItem>
                <SelectItem value="price_desc">Mayor precio</SelectItem>
                <SelectItem value="price_m2_asc">Menor precio/m²</SelectItem>
                <SelectItem value="price_m2_desc">Mayor precio/m²</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Precio Mín</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Precio Máx</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Sin límite"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minSurface">Sup. Mín (m²)</Label>
              <Input
                id="minSurface"
                type="number"
                placeholder="0"
                value={filters.minSurfaceM2 || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minSurfaceM2: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSurface">Sup. Máx (m²)</Label>
              <Input
                id="maxSurface"
                type="number"
                placeholder="Sin límite"
                value={filters.maxSurfaceM2 || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxSurfaceM2: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Buscar
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
