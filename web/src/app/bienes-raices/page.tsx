"use client";

import { PriceStatistics } from "@/components/realestate/PriceStatistics";
import { PropertyCard } from "@/components/realestate/PropertyCard";
import { PropertyFilters } from "@/components/realestate/PropertyFilters";
import { ROICalculator } from "@/components/realestate/ROICalculator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePropertyPrices } from "@/hooks/usePropertyPrices";
import type { PropertyFilter } from "@/types";
import { Building2, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function RealEstatePage() {
  const [filters, setFilters] = useState<PropertyFilter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, error } = usePropertyPrices(filters);

  const handleFiltersChange = (newFilters: PropertyFilter | null) => {
    setCurrentPage(0);
    if (newFilters) {
      setFilters({ ...newFilters, page: 0, size: 20 });
    } else {
      setFilters(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (filters) {
      setFilters({ ...filters, page: newPage });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inteligencia Inmobiliaria</h1>
        <p className="text-muted-foreground">
          Análisis de precios por m² y comparador de ROI para comprar vs alquilar
        </p>
      </div>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="prices" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Precios por m²
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Comparador ROI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <PropertyFilters onFiltersChange={handleFiltersChange} />
            </aside>

            <main className="lg:col-span-3 space-y-6">
              {isLoading && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Cargando propiedades...</p>
                </Card>
              )}

              {error && (
                <Card className="p-8 text-center border-red-200">
                  <p className="text-red-600">Error al cargar las propiedades</p>
                  <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
                </Card>
              )}

              {data && (
                <>
                  <PriceStatistics statistics={data.statistics} currency={data.currency} />

                  {data.properties.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No se encontraron propiedades con los filtros seleccionados
                      </p>
                    </Card>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Propiedades Encontradas ({data.totalElements})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Página {data.currentPage + 1} de {data.totalPages}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {data.properties.map((property) => (
                          <PropertyCard key={property.id} property={property} />
                        ))}
                      </div>

                      {data.totalPages > 1 && (
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 0}
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Anterior
                            </Button>

                            <div className="flex items-center gap-2">
                              {Array.from({ length: data.totalPages }, (_, i) => i)
                                .filter(
                                  (page) =>
                                    page === 0 ||
                                    page === data.totalPages - 1 ||
                                    Math.abs(page - currentPage) <= 1,
                                )
                                .map((page, index, array) => (
                                  <div key={`page-${page}`} className="flex items-center gap-2">
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                      <span className="text-muted-foreground">...</span>
                                    )}
                                    <Button
                                      variant={currentPage === page ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(page)}
                                      className="min-w-[40px]"
                                    >
                                      {page + 1}
                                    </Button>
                                  </div>
                                ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === data.totalPages - 1}
                            >
                              Siguiente
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>

                          <p className="text-xs text-center text-muted-foreground mt-3">
                            Mostrando {data.properties.length} de {data.totalElements} propiedades
                          </p>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}

              {!filters && !isLoading && (
                <Card className="p-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecciona filtros y presiona "Buscar" para ver propiedades
                  </p>
                </Card>
              )}
            </main>
          </div>
        </TabsContent>

        <TabsContent value="roi">
          <ROICalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
