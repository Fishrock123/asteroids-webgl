'use strict'

const fs = require('fs')
const path = require('path')

const processFrag = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-dot.frag'), 'utf8')
const clusterFrag = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-cluster.frag'), 'utf8')
const processSelectedFrag = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-dot-selected.frag'), 'utf8')
const charcoalFrag = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'charcoal.frag'), 'utf8')
const highlightFrag = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-dot-highlight.frag'), 'utf8')

const processVert = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-dot.vert'), 'utf8')
const clusterVert = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'process-cluster.vert'), 'utf8')
const position2dVert = fs.readFileSync(path.join(__dirname, '..', 'shaders', 'position-2d.vert'), 'utf8')

module.exports = {
  frag: {
    process: processFrag,
    cluster: clusterFrag,
    processSelected: processSelectedFrag,
    charcoal: charcoalFrag,
    highlight: highlightFrag
  },
  vert: {
    process: processVert,
    cluster: clusterVert,
    position2d: position2dVert
  }
}
