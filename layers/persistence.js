const fs = require("fs/promises");

async function loadData(fileName) {
    /**
     * Loads and parses JSON data from a local file.
     * @param {string} fileName - The path or name of the JSON file.
     * @returns {Objects[]} returns list of objects from the JSON file.
     */

    const data = await fs.readFile('data/' + fileName);
    return JSON.parse(data);
}
async function getAllEmployees() {
    /**
   * loads the list of employees and returns it to business layer.
   * @returns {promise<object[]>}
   */
    return await loadData("employees.json");

}
async function writeToFile(newData, fileName) {
    /**
     * Stringifies data and writes it to a JSON file
     * @param {any[]} newData - The array of data to be saved.
     * @param {string} fileName - The destination file path.
     * @returns {void}
     */

    const newList = JSON.stringify(newData, null, 2); // null, 2 to auto formate the stringified json
    await fs.writeFile('data/' + fileName, newList, "utf-8");
}
function makeID4spacesLong(letter, idNum) {
    /**
      * Adds zeros to id strings to ensure it is 4 characters long
      * used only inside the persistance layer as helper function
      * @param {string} letter - The prefix letter (e.g., 'E' or 'S').
      * @param {number|string} idNum - The numeric portion of the ID.
      * @returns {string} The formatted ID string (e.g., "E007" or "S002").
      */

    let zeros = "";
    let id = `${letter}${idNum}`;
    while (id.length < 4) {
        zeros = zeros + "0"
        id = `${letter}${zeros}${idNum}`
    }
    return id
}
async function addEmployee(name, phone) {
    /**
     * adds employee with phone number to employee.json with incremental id
     * @param {string} name - Name of the new employee
     * @param {string} phone - Phone number of the new employee
     * @returns {void}
     */


    //getting employee list 
    let employees = await loadData("employees.json");

    //accessing the numeric part of the last employee's id:
    let lastEmployeeId = parseInt(employees[employees.length - 1].employeeId.slice(1));
    const id = makeID4spacesLong("E", lastEmployeeId + 1);


    employees.push({ "employeeId": id, "name": name, "phone": phone });

    await writeToFile(employees, "employees.json");


}
async function getEmployeeShiftIds(e_id) {
    /**
     * Retrieves an array of shift ids assigned to a specific employee.
     * @param {string} e_id - The unique identifier of the employee.
     * @returns {string[]} the array of shift ids that employee is assigned to
     */
    let assignments = await loadData("assignments.json");
    let shiftIds = []
    for (let a of assignments) {
        if (a.employeeId === e_id) {
            shiftIds.push(a.shiftId);
        }
    }
    return shiftIds;
}

function computeShiftDuration(startTime, endTime) {
    /**
     * source: Gemini, prompt: "generate a function: computeShiftDuration(startTime->String, endTime->String) which tells the hours between startTime and endTime. include proper jsDoc for this function"
     * Calculates the total duration between two time strings in hours.
     * Assumes 24-hour format (e.g., "08:30", "17:00").
     * * @param {string} startTime - The start time of the shift (HH:mm).
     * @param {string} endTime - The end time of the shift (HH:mm).
     * @returns {number} The duration of the shift in hours (e.g., 8.5).
     */

    // Split strings into hours and minutes
    const [startHrs, startMins] = startTime.split(':').map(Number);
    const [endHrs, endMins] = endTime.split(':').map(Number);

    // Convert everything to total minutes from the start of the day
    const startTotalMinutes = (startHrs * 60) + startMins;
    const endTotalMinutes = (endHrs * 60) + endMins;

    // Calculate difference
    const diffInMinutes = endTotalMinutes - startTotalMinutes;

    // Return as hours (e.g., 450 minutes -> 7.5 hours)
    return diffInMinutes / 60;
}
async function isDailyHoursExceeded(employee_shifts,dateToCheck){
    const config = await loadData("config.json");
    const maxHoursAllowed = config.maxDailyHours;

    const allShifts = await loadData("shifts.json");
  
    let totalHours = 0;
    for(let shift of allShifts){
        if(shift.date === dateToCheck && employee_shifts.includes(shift.shiftId)){
            totalHours+= computeShiftDuration(shift.startTime, shift.endTime)
          
        }
    }
 
    return totalHours>maxHoursAllowed;


}
async function assignEmployee(e_id, s_id) {

    /**
     * reads shift list and employee list, then either returns
     * an error message or writes to file and returns success message
     * @param {string} e_id - The unique employee identifier.
     * @param {string} s_id - The unique shift identifier.
     * @returns {string} - string message for success or error
     * 
     */
    let shifts = await loadData("shifts.json");
    let employees = await loadData("employees.json");


    // handling error messages:

    //making sure employee with e_id already exists:
    let e_exists = false;
    for (let e of employees) {
        if (e.employeeId === e_id) {
            e_exists = true;
            break;
        }
    }
    if (!e_exists) {

        return "Employee does not exist.";
    }
    //making sure shift with s_id already exists:
    let s_exists = false;
    let dateToCheck // for the schedule limitation feature
    for (let s of shifts) {
        if (s.shiftId === s_id) {
            s_exists = true;
            dateToCheck = s.date; // catch the shift date for later use
            break;
        }
    }
    if (!s_exists) {

        return "Shift does not exist";
    }

    // make sure the employee is not assigned to the s_id shift
    const employeeShifts = await getEmployeeShiftIds(e_id)
    const alreadyAssigned = employeeShifts.includes(s_id);
    if (alreadyAssigned) {

        return "Employee already assigned to shift";
    }
    // end of checking errors
    
    // making sure daily hours don't exceed:
    employeeShifts.push(s_id);
    if(await isDailyHoursExceeded(employeeShifts, dateToCheck)){
        return "Daily hours Exceeded for employee\nshift not recorded"
    }

    //assigning employee e_id to s_id shift:
    let assignments = await loadData("assignments.json");
    assignments.push({
        "employeeId": e_id,
        "shiftId": s_id
    })
    await writeToFile(assignments, 'assignments.json');

    return "Shift Recorded";



}

async function getEmployeeSchedule(e_id) {
    /**
     * gets all shift ids associated with e_id as list from assignments.json
     * returns full info of those shifts from shifts.json
     * @param {string} e_id - The unique employee identifier.
     * @returns {Promise<object[]>} returns list of shifts assigned to e_id
     */



    // getting shiftIds of employee as a list using persistance layer 
    let currentShiftIds = await getEmployeeShiftIds(e_id);

    //getting shifts as list from persistance layer
    let allShifts = await loadData("shifts.json");
    let employeeShifts = []
    for (let shift of allShifts) {
        if (currentShiftIds.includes(shift.shiftId)) {

            employeeShifts.push(shift);

        }
    }
    return employeeShifts;

}
module.exports = {
    getAllEmployees, getEmployeeSchedule, addEmployee, assignEmployee
}

