// Testing for API
const request = require('supertest')
const app = require('./app')

describe('This is the testing for the AIT jobsheets', () => {
    test("GET Engineer Names succeeds", () => {
        return request(app).get('/loadEngineerNames').expect(200)
    })
})