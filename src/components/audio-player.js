import React from "react";
import '../css/audio-player.css'
import audioFile from '../audio/love-you.mp3'

const audioContext = new AudioContext()
const gainNode = audioContext.createGain()
const panningNode = audioContext.createStereoPanner()
const analyserNode = new AnalyserNode(audioContext)
analyserNode.fftSize = 2048
const bufferLength = analyserNode.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)
analyserNode.getByteTimeDomainData(dataArray)

let audioElement
let track
let canvas
let canvasContext

function draw () {
  requestAnimationFrame(draw)

  analyserNode.getByteTimeDomainData(dataArray)
  canvasContext.fillStyle = "rgb(200, 200, 200)"
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  canvasContext.lineWidth = 2
  canvasContext.strokeStyle = "rgb(0, 0, 0)"
  canvasContext.beginPath()

  const sliceWidth = (canvas.width * 1.0) / bufferLength
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128
    const y = (v * canvas.height) / 2

    if (i === 0) {
      canvasContext.moveTo(x, y)
    } else {
      canvasContext.lineTo(x, y)
    }
    x += sliceWidth
  }

  canvasContext.lineTo(canvas.width, canvas.height / 2)
  canvasContext.stroke()
}


class AudioPlayer extends React.Component {
  constructor (props) {
    super(props)

    this.playAudio = this.playAudio.bind(this)
    this.updateGain = this.updateGain.bind(this)
    this.updatePan = this.updatePan.bind(this)

    this.state = {
      isPlaying: false,
      gain: 1,
      panning: 0
    }
  }

  componentDidMount () {
    if (!audioElement) {
      audioElement = document.querySelector('audio')
      canvas = document.getElementById('oscilloscope')
      canvasContext = canvas.getContext('2d')

      audioElement.addEventListener('ended', () => {
        this.setState({
          isPlaying: false
        })
      })
      track = audioContext.createMediaElementSource(audioElement)
      track.connect(analyserNode).connect(gainNode).connect(panningNode).connect(audioContext.destination)
      draw()
    }
  }

  playAudio (event) {
    if (audioContext.state === 'suspended') { audioContext.resume() }
    
    if (!this.state.isPlaying) {
      audioElement.play()
      this.setState({
        isPlaying: true
      })
    } else {
      audioElement.pause()
      this.setState({
        isPlaying: false
      })
    }
  }

  updateGain (event) {
    let newValue = event.target.value
    gainNode.gain.value = newValue
    this.setState({
      gain: newValue
    })
  }

  updatePan (event) {
    let newValue = event.target.value
    panningNode.pan.value = newValue
    this.setState({
      panning: newValue
    })
  }

  render () {
    return (
      <div className="audio-player">
        <audio src={audioFile} ></audio>
        <canvas id="oscilloscope"></canvas>
        <button onClick={this.playAudio} className="play-button" data-playing="false" role='switch' aria-checked="false">Play/Pause</button>
        <label htmlFor="volume">Volume</label>
        <input type="range" id="volume" max={2} min={0} value={this.state.gain} step={0.01} onChange={this.updateGain}/>
        <label htmlFor="panning">Panning</label>
        <input type="range" id="panning" max={1} min={-1} value={this.state.panning} step={0.01} onChange={this.updatePan}/>
      </div>
    )
  }
}

export default AudioPlayer