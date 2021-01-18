const axios = require('axios').default;
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const MATCH_URL = "https://www.cricbuzz.com/live-cricket-scores/31648/4th-test-india-tour-of-australia-2020-21";
const API_URL = "https://cricket-api.vercel.app/cri.php?url=";
const SERIAL_PORT = "/dev/cu.usbmodem14401";
const SERIAL_BAUD = 9600;

const WICKET = "W";
const SIX = "6";
const FOUR = "4";

const REVIEW_COLLECTION = ["reviewed", "review", "drs"];

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


function checkBall(recentBalls) {
    //Filter Recent Balls
    let filteredString = recentBalls.replaceAll("|", "");
    filteredString = filteredString .replaceAll(".", "");
    filteredString = filteredString .replaceAll(" ", "");
    
    let ballsArray = filteredString.split("");
    var last3Balls = ballsArray.slice(ballsArray.length - 3, ballsArray.length);
    var lastBall = last3Balls[last3Balls.length - 1];

    console.log("Recent Balls :", ballsArray);
    console.log("Last Ball : ", lastBall);

    if(lastBall === WICKET ||  lastBall === WICKET.toLowerCase()){
        writeToAurduino(WICKET);
    }

    if(lastBall === FOUR){
        writeToAurduino("F");
    }

    if(lastBall === SIX ){
        writeToAurduino("S");
    }


    // For Testing
    // writeToAurduino("R");

}

function checkCommentry(commentry){
    const lastestCommentry = commentry[0].toLowerCase();

    console.log("Latest Commentry : ", lastestCommentry);
    if(lastestCommentry.includes("review")){
        writeToAurduino("R");
    }
}

function writeToAurduino($msg){
    setTimeout(function() {
        port.write( $msg + "\n");
    }, 2000);
}

function requestData(){
    axios.get(API_URL + MATCH_URL)
            .then((response) => {
                checkBall(response.data.livescore.recentballs);
                checkCommentry(response.data.livescore.commentary);
            }).catch((err)=>{
                console.log("Error Occured:", err);
    });
}

function main() {
    requestData();
    setInterval(()=>{
        requestData();
    }, 10*1000);
}

main();