declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string;
    clientSecret: string;
  }

  class Amadeus {
    constructor(options: AmadeusOptions);
    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<any>;
      };
      hotelOffersSearch: {
        get(params: any): Promise<any>;
      };
    };
    referenceData: {
      locations: {
        hotels: {
          byCity: {
            get(params: any): Promise<any>;
          };
        };
      };
    };
  }

  export = Amadeus;
}
