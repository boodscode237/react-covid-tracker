import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select
} from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Carte from './Carte';
import Table from './Table'
import { prettyPrint, sortData } from './utils'
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("Worldwide"); //this is used to define worldwide as the default value
  const [countryInfo, setCountryInfo] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setmapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")
  // this is to trigger the overall api call
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      })
  }, [])

  // the function useeffect is used to fetch countries data 
  // from api site and pull out the name and the value
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2,
            }
          ))

          const sortedData = sortData(data);
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getCountriesData();
  }, [])

  //  the function is to let the country on the country bar change as we click on it.
  // first we get the country code, and the we use it to setCountry
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    setCountry(countryCode);

    // pull the infos when we click
    // if the countryCode is worldwide, get the overall stats, else, get the specific countryCode Stat
    const url = countryCode === 'worldwide'
      ? "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url).then(response => response.json())
      .then((data) => {
        setCountry(countryCode)
        // All the data from the country response
        setCountryInfo(data);
        // changing the map location when event changes
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        console.log("value ---", setMatCenter)
        setmapZoom(12)
      })

  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker App</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country} //this is to set the default value to worldwide
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus cases"
            cases={prettyPrint(countryInfo.todayCases)}
            total={prettyPrint(countryInfo.cases)} />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrint(countryInfo.todayRecovered)}
            total={prettyPrint(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrint(countryInfo.todayDeaths)}
            total={prettyPrint(countryInfo.deaths)}
          />

        </div>

        <Carte
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by countries</h3>

          <Table countries={tableData} />

          <h3>WorldWide New {casesType}</h3>

          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>

  );
}

export default App;
