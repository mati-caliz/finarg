package com.finarg.quotes.client.factory;

import com.finarg.shared.enums.Country;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class QuoteClientFactory {

    private final Map<Country, QuoteClient> clients;

    public QuoteClientFactory(List<QuoteClient> quoteClients) {
        this.clients = new HashMap<>();
        for (QuoteClient client : quoteClients) {
            this.clients.put(client.getCountry(), client);
        }
    }

    public QuoteClient getClient(Country country) {
        QuoteClient client = clients.get(country);
        if (client == null) {
            throw new IllegalArgumentException("No quote client for country: " + country);
        }
        return client;
    }

}
