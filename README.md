
# JuStock - Stock Market Analyzer

JuStock is an Angular project that serves as a simple stock market analyzer. It provides users with the ability to explore and analyze various stocks, access market trends, and stay updated with stock market news. The application utilizes Firebase Authentication for user registration and login, and it fetches stock data from the Finnhub and Alpha Vantage APIs.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

## Installation
To run the JuStock application locally, follow these steps:

1. Clone the GitHub repository

```bash 
git clone https://github.com/rishabh1S/StockMAnalyzer.git

```

2. Navigate to the project directory

```bash
cd stock-invest-simulator
```

3. Install the dependencies

```bash
npm install
```

4. Set up the Firebase project and configure the Firebase Authentication service. Update the Firebase configuration in the src/environments/environment.ts and src/environments/environment.prod.ts files.

5. Obtain API keys for Finnhub and Alpha Vantage. Update the API keys in the src/environments/environment.ts and src/environments/environment.prod.ts files.

6. Start the application:

```bash
ng serve
```

7. Open your web browser and visit http://localhost:4200 to access the JuStock application.
## Features

- Landing Page: The landing page provides an overview of the application and includes sections such as About, Features, Market, and Contact.
- User Authentication: Users can register and log in to the application using Firebase Authentication. This allows them to access personalized features and data.
- Market Section: The Market section on the landing page displays the top trending stocks, which are updated frequently. The trending stocks are fetched from the Finnhub API.
- Stock Search: Authenticated users can search for specific stocks using the search bar. The application fetches stock data from Alpha Vantage API and displays basic stock details such as stock name, symbol, last refreshed date, stock price, price change, change percentage, open price, high price, low price, volume, market open time, and market close time.
- Stock Chart: The application renders a chart based on the selected time interval (1D, 5D, 1M, 1Y, 5Y) to visualize stock market trends. The chart provides insights into the historical performance of the selected stock.
- Stock Market News: The main page displays stock market news in the form of news cards. These news cards provide up-to-date information on the stock market and help users stay informed about the latest developments.


## API Used

JuStock utilizes the following APIs to provide stock market data and functionality:

- Finnhub API: The Finnhub API is used to fetch trending stocks for the Market section on the landing page.

- Alpha Vantage API: The Alpha Vantage API is used to retrieve detailed stock information, including stock name, symbol, price, price change, open price, high price, low price, volume, market open time, and market close time. It is also used to fetch historical stock data for rendering the stock chart.


## Conclusion

JuStock is a user-friendly stock market analyser application built with Angular. It provides an intuitive interface for users to explore stock market data, track trending stocks, and stay updated with the latest stock market news. By leveraging APIs such as Finnhub and Alpha Vantage, JuStock offers accurate and real-time stock information. Feel free to contribute to the project and enhance its functionality further.
