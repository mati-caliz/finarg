package com.finarg.realestate.service;

import com.finarg.realestate.entity.City;
import com.finarg.realestate.entity.Neighborhood;
import com.finarg.realestate.repository.CityRepository;
import com.finarg.realestate.repository.NeighborhoodRepository;
import com.finarg.shared.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class RealEstateDataSeeder implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final NeighborhoodRepository neighborhoodRepository;

    @Override
    public void run(String... args) {
        seedCabaData();
    }

    private void seedCabaData() {
        if (cityRepository.findByCode("caba").isPresent()) {
            log.info("CABA data already seeded, skipping");
            return;
        }

        log.info("Seeding CABA city and neighborhoods");

        City caba = cityRepository.save(City.builder()
            .code("caba")
            .name("Ciudad Autónoma de Buenos Aires")
            .country(Country.ARGENTINA)
            .isActive(true)
            .build());

        List<NeighborhoodData> neighborhoods = List.of(
            new NeighborhoodData("palermo", "Palermo", "Norte"),
            new NeighborhoodData("belgrano", "Belgrano", "Norte"),
            new NeighborhoodData("recoleta", "Recoleta", "Norte"),
            new NeighborhoodData("puerto-madero", "Puerto Madero", "Este"),
            new NeighborhoodData("san-telmo", "San Telmo", "Sur"),
            new NeighborhoodData("caballito", "Caballito", "Centro"),
            new NeighborhoodData("villa-crespo", "Villa Crespo", "Centro"),
            new NeighborhoodData("nunez", "Núñez", "Norte"),
            new NeighborhoodData("colegiales", "Colegiales", "Norte"),
            new NeighborhoodData("villa-urquiza", "Villa Urquiza", "Norte")
        );

        for (NeighborhoodData data : neighborhoods) {
            neighborhoodRepository.save(Neighborhood.builder()
                .code(data.code())
                .name(data.name())
                .city(caba)
                .zoneName(data.zone())
                .isActive(true)
                .build());
        }

        log.info("Successfully seeded CABA with {} neighborhoods", neighborhoods.size());
    }

    private record NeighborhoodData(String code, String name, String zone) { }
}
