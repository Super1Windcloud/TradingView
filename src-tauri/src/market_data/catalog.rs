use super::models::IndexCategoryCount;

pub(crate) struct ProviderSymbols {
    pub(crate) finnhub: Option<&'static str>,
}

pub(crate) struct IndexDefinition {
    pub(crate) id: &'static str,
    pub(crate) code: &'static str,
    pub(crate) name: &'static str,
    pub(crate) region: &'static str,
    pub(crate) currency: &'static str,
    pub(crate) categories: &'static [&'static str],
    pub(crate) symbols: ProviderSymbols,
}

pub(crate) const INDEX_CATEGORY_IDS: &[&str] = &[
    "all",
    "major",
    "us",
    "sp-sectors",
    "currency",
    "americas",
    "europe",
    "asia",
    "pacific",
    "middle-east",
    "africa",
];

pub(crate) const INDEX_DEFINITIONS: &[IndexDefinition] = &[
    IndexDefinition {
        id: "spx",
        code: "SPX",
        name: "S&P 500",
        region: "United States",
        currency: "USD",
        categories: &["all", "major", "us", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("^GSPC"),
        },
    },
    IndexDefinition {
        id: "ixic",
        code: "IXIC",
        name: "US Composite Index",
        region: "United States",
        currency: "USD",
        categories: &["all", "major", "us", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("^IXIC"),
        },
    },
    IndexDefinition {
        id: "dji",
        code: "DJI",
        name: "Dow Jones Industrial Average Index",
        region: "United States",
        currency: "USD",
        categories: &["all", "major", "us", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("^DJI"),
        },
    },
    IndexDefinition {
        id: "vix",
        code: "VIX",
        name: "CBOE Volatility Index",
        region: "United States",
        currency: "USD",
        categories: &["all", "major", "us", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("^VIX"),
        },
    },
    IndexDefinition {
        id: "tsx",
        code: "TSX",
        name: "S&P/TSX Composite Index",
        region: "Canada",
        currency: "CAD",
        categories: &["all", "major", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("^GSPTSE"),
        },
    },
    IndexDefinition {
        id: "ukx",
        code: "UKX",
        name: "UK 100 Index",
        region: "United Kingdom",
        currency: "GBP",
        categories: &["all", "major", "europe"],
        symbols: ProviderSymbols {
            finnhub: Some("^FTSE"),
        },
    },
    IndexDefinition {
        id: "dax",
        code: "DAX",
        name: "DAX Index",
        region: "Germany",
        currency: "EUR",
        categories: &["all", "major", "europe"],
        symbols: ProviderSymbols {
            finnhub: Some("^GDAXI"),
        },
    },
    IndexDefinition {
        id: "px1",
        code: "PX1",
        name: "CAC 40 Index",
        region: "France",
        currency: "EUR",
        categories: &["all", "major", "europe"],
        symbols: ProviderSymbols {
            finnhub: Some("^FCHI"),
        },
    },
    IndexDefinition {
        id: "ftmib",
        code: "FTMIB",
        name: "MILANO ITALIA BORSA INDEX",
        region: "Italy",
        currency: "EUR",
        categories: &["all", "major", "europe"],
        symbols: ProviderSymbols {
            finnhub: Some("FTSEMIB.MI"),
        },
    },
    IndexDefinition {
        id: "n225",
        code: "N225",
        name: "Japan 225 Index",
        region: "Japan",
        currency: "JPY",
        categories: &["all", "major", "asia", "pacific"],
        symbols: ProviderSymbols {
            finnhub: Some("^N225"),
        },
    },
    IndexDefinition {
        id: "kospi",
        code: "KOSPI",
        name: "KOREA COMPOSITE STOCK PRICE INDEX (KOSPI)",
        region: "South Korea",
        currency: "KRW",
        categories: &["all", "major", "asia"],
        symbols: ProviderSymbols {
            finnhub: Some("^KS11"),
        },
    },
    IndexDefinition {
        id: "hsi",
        code: "HSI",
        name: "Hang Seng Index",
        region: "Hong Kong",
        currency: "HKD",
        categories: &["all", "asia"],
        symbols: ProviderSymbols {
            finnhub: Some("^HSI"),
        },
    },
    IndexDefinition {
        id: "xjo",
        code: "XJO",
        name: "S&P/ASX 200",
        region: "Australia",
        currency: "AUD",
        categories: &["all", "pacific"],
        symbols: ProviderSymbols {
            finnhub: Some("^AXJO"),
        },
    },
    IndexDefinition {
        id: "nz50",
        code: "NZ50",
        name: "S&P/NZX 50 Index",
        region: "New Zealand",
        currency: "NZD",
        categories: &["all", "pacific"],
        symbols: ProviderSymbols {
            finnhub: None,
        },
    },
    IndexDefinition {
        id: "ta35",
        code: "TA35",
        name: "TA-35 Index",
        region: "Israel",
        currency: "ILS",
        categories: &["all", "middle-east"],
        symbols: ProviderSymbols {
            finnhub: None,
        },
    },
    IndexDefinition {
        id: "jalsh",
        code: "JALSH",
        name: "FTSE/JSE All Share",
        region: "South Africa",
        currency: "ZAR",
        categories: &["all", "africa"],
        symbols: ProviderSymbols {
            finnhub: None,
        },
    },
    IndexDefinition {
        id: "dxy",
        code: "DXY",
        name: "US Dollar Currency Index",
        region: "Global",
        currency: "USD",
        categories: &["all", "currency", "americas"],
        symbols: ProviderSymbols {
            finnhub: Some("DX-Y.NYB"),
        },
    },
    IndexDefinition {
        id: "xlb",
        code: "XLB",
        name: "Materials Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLB"),
        },
    },
    IndexDefinition {
        id: "xle",
        code: "XLE",
        name: "Energy Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLE"),
        },
    },
    IndexDefinition {
        id: "xlf",
        code: "XLF",
        name: "Financial Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLF"),
        },
    },
    IndexDefinition {
        id: "xlk",
        code: "XLK",
        name: "Technology Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLK"),
        },
    },
    IndexDefinition {
        id: "xlv",
        code: "XLV",
        name: "Health Care Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLV"),
        },
    },
    IndexDefinition {
        id: "xli",
        code: "XLI",
        name: "Industrial Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLI"),
        },
    },
    IndexDefinition {
        id: "xlp",
        code: "XLP",
        name: "Consumer Staples Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLP"),
        },
    },
    IndexDefinition {
        id: "xly",
        code: "XLY",
        name: "Consumer Discretionary Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLY"),
        },
    },
    IndexDefinition {
        id: "xlu",
        code: "XLU",
        name: "Utilities Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLU"),
        },
    },
    IndexDefinition {
        id: "xlc",
        code: "XLC",
        name: "Communication Services Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLC"),
        },
    },
    IndexDefinition {
        id: "xlre",
        code: "XLRE",
        name: "Real Estate Select Sector",
        region: "United States",
        currency: "USD",
        categories: &["all", "sp-sectors", "us"],
        symbols: ProviderSymbols {
            finnhub: Some("XLRE"),
        },
    },
];

pub(crate) fn definitions_for_category(category: &str) -> Vec<&'static IndexDefinition> {
    INDEX_DEFINITIONS
        .iter()
        .filter(|definition| category == "all" || definition.categories.contains(&category))
        .collect()
}

pub(crate) fn category_counts() -> Vec<IndexCategoryCount> {
    INDEX_CATEGORY_IDS
        .iter()
        .map(|category_id| IndexCategoryCount {
            id: (*category_id).to_string(),
            total: definitions_for_category(category_id).len(),
        })
        .collect()
}

pub(crate) fn finnhub_symbol(definition: &IndexDefinition) -> Option<&'static str> {
    definition.symbols.finnhub
}
