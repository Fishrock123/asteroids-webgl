'use strict'

const parseColor = require('parse-color')
const colors = require('../colors')

const [ , COLORS ] = buildColorTextureMap(colors)
// const COLOR_ARRAY = new Uint8Array(_colors)

function buildColorTextureMap (colors) {
  const texture = []
  const map = {}

  const keys = Object.keys(colors)
  const length = keys.length
  for (let i = 0; i < length; i++) {
    const key = keys[i]
    // The pixels are mapped to the middle of texture indicies,
    //  and not the indicies themselves.
    // Essentially a simpler ((i / length) + ((i + 1) / length)) / 2
    map[key] = (i + 0.5) / length
    texture.push(...(parseColor(colors[key]).rgb))
  }

  return [texture, map]
}

const DOT_SIZE = 2

class Ship {
  constructor () {
    this.x = 0
    this.y = 0
    this.velocity = 0.75
    this.fireDelay = 110
    this.lastFire = 0
  }
}

class Bullet {
  constructor (x, y, vx, vy) {
    this.x = x || 0
    this.y = y || 0
    this.vx = vx || 0
    this.vy = vy || 0
    this.velocity = 1.15
    this.damage = 1
  }
}

class Asteroid {
  constructor (x, y, vx, vy, size) {
    this.x = x || 0
    this.y = y || 0
    this.vx = vx || 0
    this.vy = vy || 0
    this.velocity = 0.15 / (size / 4)
    this.radius = size * 35
    this.radiusSq = this.radius * this.radius
    this.hp = 1 * size
    this.size = size
  }
}

class Game {
  constructor (gl, scale, regl, reglFns, buffer, vertexArrays, cbs) {
    this.gl = gl
    this.regl = regl
    this.reglFns = {}
    for (const key in reglFns) {
      this.reglFns[key] = reglFns[key]
    }
    this.buffer = buffer

    this.state = 'ready'
    this.score = 0
    this.cbs = cbs
    this.last = 0

    this.vertexArrays = {
      ship: new Float32Array(0),
      asteroids: new Float32Array(0),
      bullets: new Float32Array(0),
      aimLine: new Float32Array(0),
      gridLines: new Float32Array(0)
    }
    for (const key in this.vertexArrays) {
      if (vertexArrays[key] !== undefined) {
        this.vertexArrays[key] = vertexArrays[key]
      }
    }

    this.objects = {
      ship: null,
      asteroids: [],
      bullets: []
    }
    this.inputs = {
      mouseX: 0,
      mouseY: 0,
      fire: false,
      up: false,
      left: false,
      down: false,
      right: false
    }

    this.lastAsteroidSpawn = 1800
    this.asteroidSpawnTimer = 3000
    this.asteroidSpawns = [
      [500, 500],
      [-500, 500],
      [500, -500],
      [-500, -500]
    ]

    window.requestAnimationFrame(() => {
      this.regl.poll()
      this.regl.clear({
        color: [0, 0, 0, 0]
      })

      if (vertexArrays.gridLines.length > 0) {
        this.reglFns.gridLines({
          data: this.buffer(vertexArrays.gridLines),
          count: vertexArrays.gridLines.length / 2
        })
      }
    })
  }

  input (key, value) {
    this.inputs[key] = value
  }

  start () {
    this.state = 'active'

    this.last = performance.now() // eslint-disable-line no-undef
    window.requestAnimationFrame((now) => {
      const delta = now - this.last
      this.last = now
      this.logic(delta)
      this.preRender(delta)
      this.render(delta)
    })

    this.setScore(0)

    this.lastAsteroidSpawn = 1800
    this.asteroidSpawnTimer = 3000

    this.objects = {
      ship: new Ship(),
      asteroids: [],
      bullets: []
    }
    this.inputs = {
      mouseX: 0,
      mouseY: 0,
      fire: false,
      up: false,
      left: false,
      down: false,
      right: false
    }
  }

  stop () {
    this.state = 'ready'

    this.objects.ship = null
  }

  logic (delta) {
    const { inputs } = this
    const { ship, bullets, asteroids } = this.objects
    // console.log(inputs)

    let inputX = 0
    let inputY = 0
    if (inputs.up) inputY += 1
    if (inputs.left) inputX += -1
    if (inputs.down) inputY += -1
    if (inputs.right) inputX += 1

    const [dx, dy] = normalize(inputX, inputY)

    if (ship) {
      ship.x += dx * ship.velocity * delta
      ship.y += dy * ship.velocity * delta
      if (Math.abs(ship.x) > 1000) {
        ship.x = -ship.x
      }
      if (Math.abs(ship.y) > 1000) {
        ship.y = -ship.y
      }

      ship.lastFire += delta

      if (inputs.fire && ship.lastFire > ship.fireDelay) {
        const diffX = inputs.mouseX - ship.x
        const diffY = inputs.mouseY - ship.y
        const atan = Math.atan2(diffY, diffX) // y before x
        const x = ship.x
        const y = ship.y
        const vx = Math.cos(atan)
        const vy = Math.sin(atan)
        bullets.push(new Bullet(x, y, vx, vy))
        ship.lastFire = 0
      }
    }

    if (bullets.length > 0) {
      let removed = false
      for (let i = 0; i < bullets.length; removed ? i : i++) {
        removed = false
        const bullet = bullets[i]
        bullet.x += bullet.vx * bullet.velocity * delta
        bullet.y += bullet.vy * bullet.velocity * delta

        if (Math.abs(bullet.x) > 1000 || Math.abs(bullet.y) > 1000) {
          bullets.splice(i, 1)
          removed = true
        }
      }
    }

    if (asteroids.length > 0) {
      let removed = false
      for (let i = 0; i < asteroids.length; removed ? i : i++) {
        removed = false
        const asteroid = asteroids[i]
        asteroid.x += asteroid.vx * asteroid.velocity * delta
        asteroid.y += asteroid.vy * asteroid.velocity * delta

        let bRemoved = false
        for (let ii = 0; ii < bullets.length; bRemoved ? ii : ii++) {
          const bullet = bullets[ii]
          bRemoved = false
          const dx = asteroid.x - bullet.x
          const dy = asteroid.y - bullet.y
          if (dx * dx + dy * dy < asteroid.radiusSq) {
            bullets.splice(ii, 1)
            bRemoved = true

            asteroid.hp -= bullet.damage
            if (asteroid.hp <= 0) {
              asteroids.splice(i, 1)

              if (asteroid.size > 1) {
                // "split" the asteroid
                const { x, y, vx, vy } = asteroid
                const atan = Math.atan2(vy, vx) // y before x
                const a1 = atan - (0.3 + Math.random() * 0.3)
                const a2 = atan + (0.3 + Math.random() * 0.3)
                asteroids.push(new Asteroid(
                  x + asteroid.size * Math.cos(a1),
                  y + asteroid.size * Math.sin(a1),
                  Math.cos(a1),
                  Math.sin(a1),
                  asteroid.size / 2))
                asteroids.push(new Asteroid(
                  x + asteroid.size * Math.cos(a2),
                  y + asteroid.size * Math.sin(a2),
                  Math.cos(a2),
                  Math.sin(a2),
                  asteroid.size / 2))
              } else {
                this.asteroidSpawnTimer -= this.asteroidSpawnTimer / 225
              }
              if (this.asteroidSpawnTimer < 480) {
                this.asteroidSpawnTimer = 480
              }

              removed = true
              this.setScore(this.score + 50)
              break
            }
          }
        }

        if (Math.abs(asteroid.x) > 1000) {
          asteroid.x = -asteroid.x
        }
        if (Math.abs(asteroid.y) > 1000) {
          asteroid.y = -asteroid.y
        }
      }
    }

    if (ship) {
      this.lastAsteroidSpawn += delta
      if (this.lastAsteroidSpawn > this.asteroidSpawnTimer) {
        this.lastAsteroidSpawn = 0

        let spawnDist = Infinity
        let selectedSpawn = null
        for (let spawn of this.asteroidSpawns) {
          let distance = ship.x * spawn[0] + ship.y * spawn[1]
          if (distance < spawnDist) {
            spawnDist = distance
            selectedSpawn = spawn
          }
        }

        const angle = Math.random() * Math.PI * 2

        const x = selectedSpawn[0]
        const y = selectedSpawn[1]
        const vx = Math.cos(angle)
        const vy = Math.sin(angle)

        asteroids.push(new Asteroid(x, y, vx, vy, 4))
      }

      if (asteroids.length > 0) {
        for (let asteroid of asteroids) {
          const dx = asteroid.x - ship.x
          const dy = asteroid.y - ship.y
          if (dx * dx + dy * dy < asteroid.radiusSq) {
            this.cbs.gameover()
            this.stop()
            break
          }
        }
      }
    }
  }

  preRender (delta) {
    const { ship, bullets, asteroids } = this.objects

    if (ship) {
      const sx = ship.x / 1000
      const sy = ship.y / 1000
      this.vertexArrays.ship = new Float32Array([
        sx,
        sy,
        sx,
        sy,
        COLORS.seafoamBlue,
        0
      ])
    } else if (this.vertexArrays.ship.length > 0) {
      this.vertexArrays.ship = new Float32Array(0)
    }

    if (bullets.length > 0) {
      if (this.vertexArrays.bullets.length !== bullets.length * 6) {
        this.vertexArrays.bullets = new Float32Array(bullets.length * 6)
      }

      const verts = this.vertexArrays.bullets
      for (let i = 0; i < bullets.length; i++) {
        const bx = bullets[i].x / 1000
        const by = bullets[i].y / 1000
        const offset = i * 6
        verts[offset + 0] = bx
        verts[offset + 1] = by
        verts[offset + 2] = bx
        verts[offset + 3] = by
        verts[offset + 4] = COLORS.pelorusBlue
        verts[offset + 5] = 0
      }
    } else if (this.vertexArrays.bullets.length > 0) {
      this.vertexArrays.bullets = new Float32Array(0)
    }

    if (asteroids.length > 0) {
      if (this.vertexArrays.asteroids.length !== asteroids.length * 3) {
        this.vertexArrays.asteroids = new Float32Array(asteroids.length * 3)
      }

      const verts = this.vertexArrays.asteroids
      for (let i = 0; i < asteroids.length; i++) {
        const ax = asteroids[i].x / 1000
        const ay = asteroids[i].y / 1000
        const offset = i * 3
        verts[offset + 0] = ax
        verts[offset + 1] = ay
        verts[offset + 2] = asteroids[i].radius
      }
    } else if (this.vertexArrays.asteroids.length > 0) {
      this.vertexArrays.asteroids = new Float32Array(0)
    }
  }

  render (delta) {
    const gl = this.gl
    if (!gl || gl.isContextLost()) return

    const devicePixelRatio = window.devicePixelRatio || 1

    const radius = DOT_SIZE * devicePixelRatio
    const diameter = radius * 2

    const vertexArrays = this.vertexArrays

    this.regl.poll()
    this.regl.clear({
      color: [0, 0, 0, 0]
    })

    // Grid lines
    if (vertexArrays.gridLines.length > 0) {
      this.reglFns.gridLines({
        data: this.buffer(vertexArrays.gridLines),
        count: vertexArrays.gridLines.length / 2
      })
    }

    // Asteroids
    if (vertexArrays.asteroids.length > 0) {
      this.reglFns.clusters({
        data: this.buffer(vertexArrays.asteroids),
        delta: 1,
        fadeDir: 1,
        count: vertexArrays.asteroids.length / 3
      })
    }

    // Bullets
    if (vertexArrays.bullets.length > 0) {
      this.reglFns.processes({
        data: this.buffer(vertexArrays.bullets),
        delta,
        size: diameter,
        count: vertexArrays.bullets.length / 6
      })
    }

    // Player Ship
    if (vertexArrays.ship.length > 0) {
      this.reglFns.selectedProcs({
        data: this.buffer(vertexArrays.ship),
        delta,
        size: diameter * 2,
        count: vertexArrays.ship.length / 6
      })
    }

    if (this.state === 'active') {
      window.requestAnimationFrame((now) => {
        const delta = now - this.last
        this.last = now
        this.logic(delta)
        this.preRender(delta)
        this.render(delta)
      })
    } else {
      window.requestAnimationFrame(() => {
        this.regl.poll()
        this.regl.clear({
          color: [0, 0, 0, 0]
        })

        if (vertexArrays.gridLines.length > 0) {
          this.reglFns.gridLines({
            data: this.buffer(vertexArrays.gridLines),
            count: vertexArrays.gridLines.length / 2
          })
        }
      })
    }
  }

  setScore (score) {
    this.score = score
    this.cbs.score(this.score)
  }
}

module.exports = Game

// Because somehow JavaScript doesn't support vector math
function normalize (x, y) {
  const length = Math.sqrt(x * x + y * y)
  return length === 0 ? [0, 0] : [x / length, y / length]
}
