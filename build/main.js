let loc = window.location, new_uri;
if (loc.protocol === "https:") {
    new_uri = "wss:";
} else {
    new_uri = "ws:";
}
new_uri += "//" + loc.host;
const mySocket = new WebSocket(new_uri, "tidebit");
const myLunar = new Lunar();

mySocket.onmessage = function({ type, data }) {
  const d = JSON.parse(data);
  switch(d.type) {
    case 'new job':
      createJob(d);
      break;

    default:
  }
}

function createJob(data) {
  console.log('create job', data);
  const container = document.getElementsByClassName("jobBoard").item(0);
  const job = document.createElement("div");
  job.innerText = JSON.stringify(data);
  container.appendChild(job);
}

function takeJob() {

}