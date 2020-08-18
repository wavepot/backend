const fs_constants = require('fs').constants
const fs = require('fs/promises')
const path = require('path')
const express = require('express')
const randomId = require('./random-id.js')
const morgan = require('morgan')

const env = process.env.NODE_ENV ?? 'production'
const PUBLIC_PATH = path.join(__dirname, 'public')
const PROJECTS_PATH = path.join(__dirname, 'projects', env)
const SPA_PATH = path.join(PUBLIC_PATH, 'index.html')

const app = module.exports = express()
const port = env === 'test' ? 3001 : 3000

if (env === 'development') {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    next()
  })
}

app.use(morgan(env === 'production' ? 'combined' : 'dev'))

app.get('/recent', async (req, res, next) => {
  const dir = PROJECTS_PATH

  const projects = (await Promise.all(
    (await fs.readdir(dir)).map(async project => {
      const projectDir = path.join(dir, project)
      return Promise.all(
        (await fs.readdir(projectDir))
          .map(async id =>
            [project + '/' + id, await fs.stat(path.join(projectDir, id))]
          ))})))
    .flat()
    .sort((b, a) => a[1].ctime - b[1].ctime)
    .map(([name]) => name)

  res.json({ projects })
})

app.use(express.static(PUBLIC_PATH))

app.get('/:project/:id', async (req, res, next) => {
  if (!req.accepts('html')) return next()

  const { project, id } = req.params

  const targetProjectPath = path.join(PROJECTS_PATH, project, id)
  if (!targetProjectPath.startsWith(PROJECTS_PATH)) {
    res.status(403)
    res.end()
    return
  }

  try {
    await fs.access(targetProjectPath, fs_constants.F_OK)
  } catch (err) {
    console.error(err)
    res.status(404)
    res.end()
    return
  }

  res.sendFile(SPA_PATH)
})

app.use(express.static(PROJECTS_PATH, {
  setHeaders (res, path, stat) {
    res.set('Content-Type', 'application/json')
  }
}))

app.use(express.text({ type: 'application/json' }))

app.post('/:project', async (req, res) => {
  const { project } = req.params

  const targetProjectPath = path.join(PROJECTS_PATH, project)
  if (!targetProjectPath.startsWith(__dirname)) {
    res.status(403)
    res.end()
    return
  }

  try {
    await fs.access(targetProjectPath, fs_constants.F_OK)
  } catch (err) {
    await fs.mkdir(targetProjectPath, { recursive: true })
  }

  const generatedId = randomId(4)

  const targetFilePath = path.join(targetProjectPath, generatedId)
  if (!targetProjectPath.startsWith(targetProjectPath)) {
    res.status(403)
    res.end()
    return
  }

  try {
    await fs.writeFile(targetFilePath, req.body)
  } catch (err) {
    console.error(err)
    res.status(500)
    res.end()
    return
  }

  res.status(201)
  res.header('Content-Type', 'application/json')
  res.json({
    generatedId,
    success: true
  })
})

if (!module.parent) {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}
