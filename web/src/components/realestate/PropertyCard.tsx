import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types";
import { Bath, Bed, Home, Ruler } from "lucide-react";
import { memo } from "react";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = memo(function PropertyCard({ property }: PropertyCardProps) {
  const formatCurrency = (value: number, currency: string) => {
    return `${currency} ${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getPortalBadgeColor = (portal: string) => {
    if (portal.toLowerCase().includes("zonaprop")) return "bg-blue-100 text-blue-800";
    if (portal.toLowerCase().includes("argenprop")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-t-[3px] border-t-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5" />
            {property.neighborhoodName}
          </CardTitle>
          <Badge className={getPortalBadgeColor(property.portalSource)}>
            {property.portalSource}
          </Badge>
        </div>
        {property.address && (
          <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(property.currentPrice, property.currency)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(property.pricePerM2, property.currency)} / m²
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {property.surfaceM2 > 0 && (
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              <span>{property.surfaceM2.toLocaleString("es-AR")} m²</span>
            </div>
          )}
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
          <span>{property.propertyType}</span>
          <span>{property.operationType === "SALE" ? "Venta" : "Alquiler"}</span>
        </div>
      </CardContent>
    </Card>
  );
});
