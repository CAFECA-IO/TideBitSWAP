/* sass */
import "./themes/main.scss";
/* javascript */
import Litepicker from "litepicker";
const a = 1;

const input = document.getElementById("datepicker");
const startDate = new Date();
const endDate = new Date();
startDate.setDate(startDate.getDate() - 7);

let picker = new Litepicker({
  element: document.getElementById("datepicker"),
  singleMode: false,
});
picker.setDateRange(startDate, endDate);