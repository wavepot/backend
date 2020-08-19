const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
chai.use(chaiHttp)

const app = require('./app.js')

describe('routes', () => {
  let generatedId

  it('POST /<foo> -- should post a project', () =>
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

  it('GET /<foo>/<id> -- should fetch that project by id', () =>
    chai.request(app)
      .get('/foo/' + generatedId)
      .set('Accept', 'application/json')
      .then(res => {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res).to.have.header('Content-Type', /json/)
        expect(res.body.files).to.be.an('array')
      }))

  it('GET /recent -- should get a recent project list', () =>
    chai.request(app)
      .get('/recent')
      .set('Accept', 'application/json')
      .then(res => {
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res).to.have.header('Content-Type', /json/)
        expect(res.body.projects).to.be.an('array')
        expect(res.body.projects[0]).to.include('foo/')
      }))

  it('GET /fetch?url=http://some-remote-url -- fetch proxy should succeed', () =>
    chai.request(app)
      .get('/fetch?url=https://google.com')
      .then(res => {
        expect(res).to.have.status(200)
      }))

  it('GET /fetch?url=invalid -- fetch proxy should fail', () =>
    chai.request(app)
      .get('/fetch?url=invalid')
      .then(res => {
        expect(res).to.have.status(500)
      }))

  it('GET /fetch?url=freesound:<sound_id> -- should fetch sound from freesound api', () =>
    chai.request(app)
      .get('/fetch?url=freesound:212208')
      .then(res => {
        expect(res).to.have.status(200)
      }))
})
