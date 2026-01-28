package com.finarg.client;

import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;

import java.util.List;

public interface QuoteClient {
    
    Country getCountry();
    
    List<QuoteDTO> getAllQuotes();
    
    QuoteDTO getQuote(CurrencyType type);
}
