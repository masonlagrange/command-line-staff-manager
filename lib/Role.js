class Role {
    constructor(title, salary, department_id) {
        this.title = title
        this.salary = salary
        this.department_id = department_id
    }
    getAdd() {
        const profile = `"${this.title}", ${this.salary}, ${this.department_id}`
        return profile
    }
}
module.exports = Role