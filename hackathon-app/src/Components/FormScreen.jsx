import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Box, Slider, Stack, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import axios from "axios";
import { useData } from "../../contexts/AppContext";
import CircularProgress from '@mui/material/CircularProgress';


let cities = [
  "Actinium",
  "Aluminum",
  "Americium",
  "Antimony",
  "Argon",
  "Arsenic",
  "Astatine",
  "Barium",
  "Beryllium",
  "Bismuth",
  "Boron",
  "Bromine",
  "Cadmium",
  "Calcium",
  "Carbon",
  "Cerium",
  "Cesium",
  "Chlorine",
  "Chromium",
  "Cobalt",
  "Copper",
  "Curium",
  "Dysprosium",
  "Erbium",
  "Europium",
  "Fluorine",
  "Francium",
  "Gadolinium",
  "Gallium",
  "Germanium",
  "Gold",
  "Hafnium",
  "Helium",
  "Holmium",
  "Hydrogen",
  "Indium",
  "Iodine",
  "Iridium",
  "Iron",
  "Krypton",
  "Lanthanum",
  "Lead",
  "Lithium",
  "Lutetium",
  "Magnesium",
  "Manganese",
  "Mercury",
  "Molybdenum",
  "Neodymium",
  "Neon",
  "Neptunium",
  "Nickel",
  "Niobium",
  "Nitrogen",
  "Osmium",
  "Oxygen",
  "Palladium",
  "Phosphorus",
  "Platinum",
  "Plutonium",
  "Polonium",
  "Potassium",
  "Praseodymium",
  "Promethium",
  "Protactinium",
  "Radium",
  "Radon",
  "Rhenium",
  "Rhodium",
  "Rubidium",
  "Ruthenium",
  "Samarium",
  "Scandium",
  "Selenium",
  "Silicon",
  "Silver",
  "Sodium",
  "Strontium",
  "Sulfur",
  "Tantalum",
  "Technetium",
  "Tellurium",
  "Terbium",
  "Thallium",
  "Thorium",
  "Thulium",
  "Tin",
  "Titanium",
  "Tungsten",
  "Uranium",
  "Vanadium",
  "Xenon",
  "Ytterbium",
  "Yttrium",
  "Zinc",
  "Zirconium",
];

function FormScreen() {
  const {setRoutes, isLoading, setIsLoading} = useData()
  const [dateTime, setDateTime] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("pollution");
  const [switchColor, setSwitchColor] = useState("green");

  const handleSubmit = async () => {
    setIsLoading(true)
    const formattedDate = dateTime ? dateTime.format("MM/DD/YYYY HH:mm") : "";
    const data = {
      source,
      target: destination,
      date: formattedDate,
      weight_value: mode,
    };

    try {
      const response = await axios.post("http://127.0.0.1:5000/", data);
      console.log("Response:", response.data[1]);
      setRoutes(response.data[1]);
      setIsLoading(false)
    } catch (error) {
      console.error("There was an error sending the data!", error);
      setIsLoading(false)
    }
  };

  const handleNowButtonClick = () => {
    setDateTime(dayjs());
  };

  const handleModeChange = (event) => {
    const newMode = event.target.checked ? "time" : "pollution";
    setMode(newMode);
    setSwitchColor(newMode === "time" ? "orange" : "green");
  };

  return (
    <div className="container">
      <div className="wrapper-form">
        <h1 style={{fontFamily:"Fredoka"}}>Navigation</h1>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={cities}
          onChange={(event, newValue) => setSource(newValue)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Source" />}
        />
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={cities}
          onChange={(event, newValue) => setDestination(newValue)}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Destination" />
          )}
        />
        <div className="datetime-wrapper">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              sx={{ alignItems: "flex-start" }}
              ampm={false}
              label="Date & Time"
              value={dateTime}
              onChange={(newValue) => setDateTime(newValue)}
              minDate={dayjs()}
            />
            <button className="datetime-now" onClick={handleNowButtonClick}>
              Now
            </button>
          </LocalizationProvider>
        </div>
        <Box sx={{ width: 300 }}>
          <span className={`switch-title ${mode==="pollution" ? "greener" : "faster"}`}>{mode === "pollution" ? "Greener" : "Faster"}</span>
          <Stack
            spacing={2}
            direction="row"
            sx={{ mb: 1, justifyContent: "center" }}
            alignItems="center"
          >
            <img src="green-energy.png" style={{ width: "25px" }} alt="" />
            <Switch
              checked={mode === "time"}
              onChange={handleModeChange}
              sx={{
                "& .MuiSwitch-switchBase": {
                  color: switchColor,
                },
                "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                  backgroundColor: switchColor,
                },
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: switchColor,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: switchColor,
                },
              }}
            />
            <img src="quick.png" style={{ width: "35px" }} alt="" />
          </Stack>
        </Box>
        <button onClick={handleSubmit} className={`nav-btn ${isLoading ? 'loading' : ''}`}>
          {!isLoading && <><img style={{ width: "20px" }} src="compass.png" alt="" /> Navigate</>}
          {isLoading && <CircularProgress size={20} sx={{color:"white"}}/>}
          
          
        </button>
      </div>
    </div>
  );
}

export default FormScreen;
