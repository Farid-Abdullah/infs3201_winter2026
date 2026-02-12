const persistence = require("./persistence")

async function getAllEmployees() {
    /**
     * takes list of employees from persistance layer and returns it to presentation layer
     * @returns {promise<object[]>}
     */

    return await persistence.getAllEmployees();
}

async function addEmployee(name, phone) {
    /**
     * passthrough function, uses persistence layer to add an employee to database
     * @param {string} name - Name of the new employee
     * @param {string} phone - Phone number of the new employee
     * @returns {void}
     */

    await persistence.addEmployee(name, phone);
}

async function assignEmployee(e_id, s_id) {

    /**
     * passthrough function: asks persistance layer to assign shift s_id to employee e_id
     * @param {string} e_id - The unique employee identifier.
     * @param {string} s_id - The unique shift identifier.
     * @returns {string} - string message for success or error from persistance layer
     * 
     */
    return await persistence.assignEmployee(e_id, s_id);



}

async function getEmployeeSchedule(e_id) {
    /**
     * gets list of shifts specific to the given employee from persistance layer and returns it
     * @param {string} e_id - The unique employee identifier.
     * @returns {Promise<object[]>} returns list of shifts assigned to e_id
     */

    return await persistence.getEmployeeSchedule(e_id);

}

module.exports = {
    getAllEmployees, addEmployee, assignEmployee, getEmployeeSchedule
}