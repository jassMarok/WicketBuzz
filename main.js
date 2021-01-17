const axios = require('axios').default;
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const MATCH_URL = "https://www.cricbuzz.com/live-cricket-scores/31648/4th-test-india-tour-of-australia-2020-21";
const API_URL = "https://cricket-api.vercel.app/cri.php?url=";
const SERIAL_PORT = "/dev/cu.usbmodem14401";
const SERIAL_BAUD = 9600;

const WICKET = "W";

const port = new SerialPort(SERIAL_PORT, {
    baudRate: SERIAL_BAUD,
});

const parser = port.pipe(new Readline({ delimiter: '\n' }));// Read


port.on("open", () => {
  console.log('Serial Port : Open');
});

parser.on('data', data =>{
  console.log('Log : ', data);
});


function checkWicket(recentBalls) {
    //Filter Recent Balls
    let filteredString = recentBalls.replaceAll("|", "");
    filteredString = filteredString .replaceAll(".", "");
    filteredString = filteredString .replaceAll(" ", "");
    
    let ballsArray = filteredString.split("");
    console.log("Recent Balls :", ballsArray);

    var last3Balls = ballsArray.slice(ballsArray.length - 3, ballsArray.length);
    console.log("Last Three Balls : ", last3Balls);

    if(last3Balls.includes(WICKET) || last3Balls.includes(WICKET.toLowerCase())){
        writeToAurduino(WICKET);
    }

    //For Testing
    // if(last3Balls.includes("0")){
    //     writeToAurduino(WICKET);
    // }
}

function writeToAurduino($msg){
    setTimeout(function() {
        port.write( $msg + "\n");
    }, 2000);
}

function requestData(){
    axios.get(API_URL + MATCH_URL)
            .then((response) => {
                console.log(response);
                checkWicket(response.data.livescore.lastwicket);
            }).catch((err)=>{
                console.log("Error Occured:", err);
    });
}

function main() {
    requestData();
    setInterval(()=>{
        requestData();
    }, 30*1000);
}

main();