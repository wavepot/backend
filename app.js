require('dotenv').config()
const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const express = require('express')
const randomId = require('./random-id.js')
const fetch = require('node-fetch')
const morgan = require('morgan')
const util = require('util')
const pipeline = util.promisify(require('stream').pipeline)

const Env = process.env
const env = Env.NODE_ENV ?? 'production'
const PUBLIC_PATH = path.join(__dirname, 'public')
const PROJECTS_PATH = path.join(__dirname, 'projects', env)
const CACHE_PATH = path.join(__dirname, 'cache', env)
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
    (await fsp.readdir(dir)).map(async project => {
      const projectDir = path.join(dir, project)
      return Promise.all(
        (await fsp.readdir(projectDir))
          .map(async id =>
            [project + '/' + id, await fsp.stat(path.join(projectDir, id))]
          ))})))
    .flat()
    .sort((b, a) => a[1].ctime - b[1].ctime)
    .map(([name]) => name)

  res.json({ projects })
})

// fetch proxy with caching
const cacheStatic = express.static(CACHE_PATH)
app.get('/fetch', async (req, res, next) => {
  const url = req.query.url
  const slug = url.replace(/[^a-z0-9]/gi, '-')
  req.url = '/' + slug
  cacheStatic(req, res, async () => {
    try {
      let response

      const Url = new URL(url)
      if (Url.protocol === 'freesound:') {
        const id = Url.pathname
        const sound = await fetch(`https://freesound.org/apiv2/sounds/${id}/?fields=previews&token=${Env.FREESOUND_API_TOKEN}`)
        if (!sound.ok) throw new Error(`unexpected response ${sound.statusText}`)
        const json = await sound.json()
        response = await fetch(json.previews['preview-lq-ogg'] + '?token=' + Env.FREESOUND_API_TOKEN)
      } else {
        response = await fetch(url)
      }

      if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
      await pipeline(response.body, fs.createWriteStream(path.join(CACHE_PATH, slug)))
    } catch (error) {
      console.error(error)
      res.status(500)
      res.end()
      return
    }
    cacheStatic(req, res, next)
  })
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
    await fsp.access(targetProjectPath, fs.constants.F_OK)
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
    await fsp.access(targetProjectPath, fs.constants.F_OK)
  } catch (err) {
    await fsp.mkdir(targetProjectPath, { recursive: true })
  }

  const generatedId = randomId(4)

  const targetFilePath = path.join(targetProjectPath, generatedId)
  if (!targetProjectPath.startsWith(targetProjectPath)) {
    res.status(403)
    res.end()
    return
  }

  try {
    await fsp.writeFile(targetFilePath, req.body)
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
