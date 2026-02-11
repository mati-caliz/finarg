package com.finarg.quotes.client.factory;

import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;

import java.util.List;

public interface QuoteClient {
    
    Country getCountry();
    
    List<QuoteDTO> getAllQuotes();
    
    QuoteDTO getQuote(CurrencyType type);
}
