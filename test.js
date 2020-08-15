const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
chai.use(chaiHttp)

const app = require('./app.js')

describe('routes', () => {
  let generatedId

  it('should post a project', () =>
    chai.request(app)
      .post('/foo')
      .send({
        files: [
          { filename: 'foo.js', value: 'foo' },
          { filename: 'bar.js', value: 'bar' },
        ]
      })
      .then(res => {
        expect(res).to.have.status(201)
        expect(res).to.be.json
        expect(res).to.have.header('Content-Type', /json/)
        expect(res.body.generatedId).to.match(/[a-z0-9]/gi)
        generatedId = res.body.generatedId
      }))

  it('should fetch that project by id', () =>
    chai.request(app)
      .get('/foo/' + generatedId)
      .set('Accept', 'application/json')
      .then(res => {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res).to.have.header('Content-Type', /json/)
        expect(res.body.files).to.be.an('array')
      }))
})
