package com.finarg.service;

import com.finarg.model.dto.ArbitrajeDTO;
import com.finarg.model.dto.CotizacionDTO;
import com.finarg.model.enums.TipoDolar;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArbitrajeDetectorService {

    private final CotizacionService cotizacionService;

    private static final BigDecimal COMISION_ESTIMADA = new BigDecimal("0.5"); // 0.5%
    private static final BigDecimal UMBRAL_RENTABILIDAD = new BigDecimal("1.5"); // 1.5% minimo

    public List<ArbitrajeDTO> detectarOportunidades() {
        log.info("Detectando oportunidades de arbitraje");
        
        Map<TipoDolar, CotizacionDTO> cotizaciones = cotizacionService.getCotizacionesMap();
        List<ArbitrajeDTO> oportunidades = new ArrayList<>();

        // MEP vs Blue
        ArbitrajeDTO mepBlue = analizarArbitraje(
                cotizaciones.get(TipoDolar.BOLSA),
                cotizaciones.get(TipoDolar.BLUE),
                "Comprar MEP, vender Blue",
                "1. Comprar bonos AL30 en pesos\n2. Vender bonos AL30 contra dolar MEP\n3. Retirar dolares\n4. Vender en mercado Blue"
        );
        if (mepBlue != null && mepBlue.isViable()) {
            oportunidades.add(mepBlue);
        }

        // CCL vs Blue
        ArbitrajeDTO cclBlue = analizarArbitraje(
                cotizaciones.get(TipoDolar.CCL),
                cotizaciones.get(TipoDolar.BLUE),
                "Comprar CCL, vender Blue",
                "1. Comprar bonos AL30 en pesos\n2. Transferir a broker extranjero\n3. Vender contra dolares\n4. Traer y vender en Blue"
        );
        if (cclBlue != null && cclBlue.isViable()) {
            oportunidades.add(cclBlue);
        }

        // Crypto vs Blue
        ArbitrajeDTO cryptoBlue = analizarArbitraje(
                cotizaciones.get(TipoDolar.CRIPTO),
                cotizaciones.get(TipoDolar.BLUE),
                "Comprar Crypto, vender Blue",
                "1. Comprar USDT/DAI en exchange argentino\n2. Transferir a wallet\n3. Vender P2P o en cueva"
        );
        if (cryptoBlue != null && cryptoBlue.isViable()) {
            oportunidades.add(cryptoBlue);
        }

        // Blue vs Oficial (reverso - si el blue esta muy bajo)
        ArbitrajeDTO oficialBlue = analizarArbitrajeReverso(
                cotizaciones.get(TipoDolar.OFICIAL),
                cotizaciones.get(TipoDolar.BLUE),
                "Comprar Oficial (si accedes), vender Blue",
                "Solo aplica si tenes acceso al dolar oficial (importador, etc)"
        );
        if (oficialBlue != null && oficialBlue.isViable()) {
            oportunidades.add(oficialBlue);
        }

        log.info("Encontradas {} oportunidades de arbitraje", oportunidades.size());
        return oportunidades;
    }

    private ArbitrajeDTO analizarArbitraje(CotizacionDTO origen, CotizacionDTO destino, 
                                           String descripcion, String pasos) {
        if (origen == null || destino == null) {
            return null;
        }

        BigDecimal precioCompra = origen.getVenta(); // Compro al precio de venta
        BigDecimal precioVenta = destino.getCompra(); // Vendo al precio de compra

        if (precioCompra.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        BigDecimal spreadBruto = precioVenta.subtract(precioCompra)
                .divide(precioCompra, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        BigDecimal spreadNeto = spreadBruto.subtract(COMISION_ESTIMADA.multiply(BigDecimal.valueOf(2)));
        
        BigDecimal ganancia1000 = new BigDecimal("1000")
                .multiply(spreadNeto)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        boolean viable = spreadNeto.compareTo(UMBRAL_RENTABILIDAD) > 0;
        String riesgo = calcularRiesgo(spreadNeto);

        return ArbitrajeDTO.builder()
                .tipoOrigen(origen.getTipo())
                .tipoDestino(destino.getTipo())
                .cotizacionOrigen(precioCompra)
                .cotizacionDestino(precioVenta)
                .spreadPorcentaje(spreadNeto.setScale(2, RoundingMode.HALF_UP))
                .gananciaEstimadaPor1000USD(ganancia1000)
                .descripcion(descripcion)
                .pasos(pasos)
                .viable(viable)
                .riesgo(riesgo)
                .build();
    }

    private ArbitrajeDTO analizarArbitrajeReverso(CotizacionDTO origen, CotizacionDTO destino,
                                                   String descripcion, String pasos) {
        if (origen == null || destino == null) {
            return null;
        }

        BigDecimal precioCompra = origen.getVenta();
        BigDecimal precioVenta = destino.getCompra();

        if (precioCompra.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        BigDecimal spreadBruto = precioVenta.subtract(precioCompra)
                .divide(precioCompra, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        boolean viable = spreadBruto.compareTo(new BigDecimal("20")) > 0; // Solo si la brecha es muy alta

        return ArbitrajeDTO.builder()
                .tipoOrigen(origen.getTipo())
                .tipoDestino(destino.getTipo())
                .cotizacionOrigen(precioCompra)
                .cotizacionDestino(precioVenta)
                .spreadPorcentaje(spreadBruto.setScale(2, RoundingMode.HALF_UP))
                .gananciaEstimadaPor1000USD(BigDecimal.ZERO)
                .descripcion(descripcion)
                .pasos(pasos)
                .viable(viable)
                .riesgo("alto")
                .build();
    }

    private String calcularRiesgo(BigDecimal spread) {
        if (spread.compareTo(new BigDecimal("5")) > 0) {
            return "bajo";
        } else if (spread.compareTo(new BigDecimal("2")) > 0) {
            return "medio";
        } else {
            return "alto";
        }
    }
}
