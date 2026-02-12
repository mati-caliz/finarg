package com.finarg.realestate.client.factory;

import com.finarg.realestate.client.PropertyClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PropertyClientFactory {

    private final List<PropertyClient> clients;

    public List<PropertyClient> getClientsForCity(String cityCode) {
        return clients.stream()
            .filter(client -> client.isAvailableForCity(cityCode))
            .toList();
    }

}
