import "./App.css";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import Card from "./SummaryCard";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
// Imports end
function App() {
  const locationList = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "can", label: "Canada" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" },
  ];
  const baseUrl = "https://api.opencovid.ca";
  const timeseriesOptions = {
    responsive: true,
    normalized: true,
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
      },
    },
  };
  const [activeLocation, setActiveLocation] = useState("can");
  const [lastUpdated, setlastUpdated] = useState("");
  const [summaryData, setSummaryData] = useState({});
  const [timeseriesData, setTimeseriesData] = useState({
    datasets: [],
  });

  useEffect(() => {
    getVersion();
    getSummaryData();
    getTimeseriesData();
  }, [activeLocation]);

  const getVersion = async () => {
    const res = await fetch(`${baseUrl}/version`);
    const data = await res.json();
    setlastUpdated(data.summary);
  };
  const getSummaryData = async () => {
    let res;
    if (activeLocation === "can") {
      res = await fetch(`${baseUrl}/summary?geo=${activeLocation}`);
    } else {
      res = await fetch(`${baseUrl}/summary?loc=${activeLocation}`);
    }
    let resData = await res.json();
    console.log(resData);
    let summaryData = resData.data[0];
    console.log(summaryData);
    let formattedData = {};

    Object.keys(summaryData).map(
      (key) => (formattedData[key] = summaryData[key].toLocaleString())
    );
    console.log(formattedData);
    setSummaryData(formattedData);
  };
  const getTimeseriesData = async (location) => {
    const res = await fetch(
      `${baseUrl}/timeseries?loc=${activeLocation}&ymd=true`
    );

    const data = await res.json();
    setTimeseriesData({ datasets: timeseriesDataMap(data) });
  };
  function timeseriesDataMap(fetchedData) {
    let tsKeyMap = [
      {
        datasetLabel: "active",
        dataKey: "active_cases",
        dateKey: "date_active",
        borderColor: "red",
      },
      {
        datasetLabel: "mortality",
        dataKey: "cumulative_deaths",
        dateKey: "date_death_report",
        borderColor: "grey",
      },
      {
        datasetLabel: "recovered",
        dataKey: "recovered",
        dateKey: "date_recovered",
        borderColor: "blue",
      },
    ];

    let datasets = [];
    tsKeyMap.forEach((dataSeries) => {
      let dataset = {
        label: dataSeries.datasetLabel,
        borderColor: dataSeries.borderColor,
        data: fetchedData[dataSeries.datasetLabel].map((dataPoint) => {
          return {
            y: dataPoint[dataSeries.dataKey],
            x: dataPoint[dataSeries.dateKey],
          };
        }),
      };
      datasets.push(dataset);
    });
    return datasets;
  }
  return (
    <div className="App">
      <h1>COVID 19 Dashboard </h1>
      <div className="dashboard-container">
        <div className="dashboard-menu ">
          <Select
            options={locationList}
            onChange={(selectedOption) =>
              setActiveLocation(selectedOption.value)
            }
            defaultValue={locationList.filter(
              (options) => options.value == activeLocation
            )}
            className="dashboard-select"
          />
          <p className="update-date">Last Updated : {lastUpdated}</p>
        </div>
        <div className="dashboard-timeseries">
          <Line
            data={timeseriesData}
            options={timeseriesOptions}
            className="line-chart"
          />
        </div>
        <div className="dashboard-summary">
          <Card title="Total Cases" value={summaryData.cases} />
          <Card title="Total Recovered" value={summaryData.tests_completed} />
          <Card title="Total Deaths" value={summaryData.deaths} />
          <Card
            title="Total Vaccinated"
            value={summaryData.vaccine_administration_total_doses}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
