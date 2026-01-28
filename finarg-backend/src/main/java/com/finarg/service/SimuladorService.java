package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.model.dto.CotizacionDTO;
import com.finarg.model.dto.SimulacionRequestDTO;
import com.finarg.model.dto.SimulacionResponseDTO;
import com.finarg.model.enums.TipoDolar;
import com.finarg.model.enums.TipoInversion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimuladorService {

    private final ArgentinaDatosClient argentinaDatosClient;
    private final CotizacionService cotizacionService;
    private final InflacionService inflacionService;

    private static final BigDecimal TASA_PF_DEFAULT = new BigDecimal("35");
    private static final BigDecimal TASA_FCI_MM = new BigDecimal("32");
    private static final BigDecimal TASA_CAUCION = new BigDecimal("30");
    private static final BigDecimal TASA_STABLECOIN = new BigDecimal("5");

    public SimulacionResponseDTO simular(SimulacionRequestDTO request) {
        log.info("Simulando rendimiento: {} - {} - {} dias", 
                request.getTipoInversion(), request.getMontoInicial(), request.getPlazoDias());

        BigDecimal tasaTNA = obtenerTasa(request.getTipoInversion(), request.getTasaPersonalizada());
        BigDecimal tasaTEA = calcularTEA(tasaTNA);

        BigDecimal rendimientoNominal = calcularRendimiento(
                request.getMontoInicial(), 
                tasaTNA, 
                request.getPlazoDias()
        );

        BigDecimal montoFinal = request.getMontoInicial().add(rendimientoNominal);

        CotizacionDTO dolarBlue = cotizacionService.getCotizacion(TipoDolar.BLUE);
        BigDecimal cotizacionDolar = dolarBlue != null ? dolarBlue.getVenta() : new BigDecimal("1000");

        BigDecimal montoInicialUSD = request.getMontoInicial()
                .divide(cotizacionDolar, 2, RoundingMode.HALF_UP);
        BigDecimal montoFinalUSD = montoFinal.divide(cotizacionDolar, 2, RoundingMode.HALF_UP);
        BigDecimal gananciaUSD = montoFinalUSD.subtract(montoInicialUSD);

        BigDecimal inflacionEstimada = estimarInflacion(request.getPlazoDias());
        BigDecimal rendimientoReal = tasaTNA.subtract(inflacionEstimada);

        List<SimulacionResponseDTO.ProyeccionMensual> proyeccion = generarProyeccion(
                request.getMontoInicial(),
                tasaTNA,
                request.getPlazoDias(),
                request.isReinvertir()
        );

        return SimulacionResponseDTO.builder()
                .tipoInversion(request.getTipoInversion())
                .montoInicial(request.getMontoInicial())
                .plazoDias(request.getPlazoDias())
                .tasaTNA(tasaTNA.setScale(2, RoundingMode.HALF_UP))
                .tasaTEA(tasaTEA.setScale(2, RoundingMode.HALF_UP))
                .rendimientoNominal(rendimientoNominal.setScale(2, RoundingMode.HALF_UP))
                .rendimientoReal(rendimientoReal.setScale(2, RoundingMode.HALF_UP))
                .montoFinal(montoFinal.setScale(2, RoundingMode.HALF_UP))
                .gananciaARS(rendimientoNominal.setScale(2, RoundingMode.HALF_UP))
                .gananciaUSD(gananciaUSD.setScale(2, RoundingMode.HALF_UP))
                .rendimientoEnDolares(gananciaUSD.divide(montoInicialUSD, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP))
                .proyeccion(proyeccion)
                .build();
    }

    private BigDecimal obtenerTasa(TipoInversion tipo, BigDecimal tasaPersonalizada) {
        if (tasaPersonalizada != null && tasaPersonalizada.compareTo(BigDecimal.ZERO) > 0) {
            return tasaPersonalizada;
        }

        return switch (tipo) {
            case PLAZO_FIJO -> obtenerTasaPlazoFijoReal();
            case PLAZO_FIJO_UVA -> obtenerTasaUVA();
            case FCI_MONEY_MARKET -> TASA_FCI_MM;
            case FCI_RENTA_FIJA -> TASA_FCI_MM.subtract(new BigDecimal("2"));
            case CAUCION -> TASA_CAUCION;
            case STABLECOIN_DAI, STABLECOIN_USDT -> TASA_STABLECOIN;
        };
    }

    private BigDecimal obtenerTasaPlazoFijoReal() {
        try {
            List<ArgentinaDatosClient.TasaPlazoFijoResponse> tasas = argentinaDatosClient.getTasasPlazoFijo();
            if (!tasas.isEmpty()) {
                return tasas.stream()
                        .map(ArgentinaDatosClient.TasaPlazoFijoResponse::getTnaClientes)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(tasas.size()), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        } catch (Exception e) {
            log.warn("Error obteniendo tasa PF real, usando default");
        }
        return TASA_PF_DEFAULT;
    }

    private BigDecimal obtenerTasaUVA() {
        return inflacionService.getInflacionActual().getValor()
                .multiply(BigDecimal.valueOf(12))
                .add(new BigDecimal("1"));
    }

    private BigDecimal calcularTEA(BigDecimal tna) {
        double tnaDecimal = tna.doubleValue() / 100;
        double tea = Math.pow(1 + tnaDecimal / 365, 365) - 1;
        return BigDecimal.valueOf(tea * 100);
    }

    private BigDecimal calcularRendimiento(BigDecimal monto, BigDecimal tasaTNA, int dias) {
        return monto.multiply(tasaTNA)
                .multiply(BigDecimal.valueOf(dias))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal estimarInflacion(int dias) {
        BigDecimal inflacionMensual = inflacionService.getInflacionActual().getValor();
        return inflacionMensual.multiply(BigDecimal.valueOf(dias))
                .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }

    private List<SimulacionResponseDTO.ProyeccionMensual> generarProyeccion(
            BigDecimal montoInicial, BigDecimal tasaTNA, int plazo, boolean reinvertir) {
        
        List<SimulacionResponseDTO.ProyeccionMensual> proyeccion = new ArrayList<>();
        BigDecimal capital = montoInicial;
        int meses = Math.min(plazo / 30, 12);

        for (int mes = 1; mes <= meses; mes++) {
            BigDecimal interesMes = capital.multiply(tasaTNA)
                    .divide(BigDecimal.valueOf(1200), 2, RoundingMode.HALF_UP);
            
            if (reinvertir) {
                capital = capital.add(interesMes);
            }

            BigDecimal inflacionMes = inflacionService.getInflacionActual().getValor();
            BigDecimal rendReal = tasaTNA.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                    .subtract(inflacionMes);

            proyeccion.add(SimulacionResponseDTO.ProyeccionMensual.builder()
                    .mes(mes)
                    .capitalAcumulado(capital.setScale(2, RoundingMode.HALF_UP))
                    .interesesMes(interesMes)
                    .inflacionEstimada(inflacionMes)
                    .rendimientoReal(rendReal.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return proyeccion;
    }

    public List<TasaActual> getTasasActuales() {
        return List.of(
                new TasaActual(TipoInversion.PLAZO_FIJO, obtenerTasaPlazoFijoReal()),
                new TasaActual(TipoInversion.PLAZO_FIJO_UVA, obtenerTasaUVA()),
                new TasaActual(TipoInversion.FCI_MONEY_MARKET, TASA_FCI_MM),
                new TasaActual(TipoInversion.CAUCION, TASA_CAUCION),
                new TasaActual(TipoInversion.STABLECOIN_DAI, TASA_STABLECOIN)
        );
    }

    public record TasaActual(TipoInversion tipo, BigDecimal tasa) { }
}
