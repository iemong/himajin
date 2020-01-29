import React from 'react';
import {Howl} from 'howler';
import './App.css';
import John from './john.png';
// @ts-ignore
import soundfile from "./imagine.mp3"
import * as faceapi from 'face-api.js';
import styled from "styled-components";

const App: React.FC = () => {
    const [sound, setSound] = React.useState<Howl | null>(null)
    const [score, setScore] = React.useState<number>(0)
    const [area, setArea] = React.useState<number>(0)
    const [point, setPoint] = React.useState<{ x: number, y: number }>({x: 0, y: 0})
    const [normalPoint, setNormalPoint] = React.useState<number>(0)
    const videoRef = React.useRef<HTMLVideoElement | null>(null)
    const isPlayingRef = React.useRef<boolean>(false)
    const [canDetect, setCanDetect] = React.useState<boolean>(false)

    React.useEffect(() => {
        const howler = new Howl({
            src: [soundfile],
            autoplay: false,
            loop: true,
            volume: 0.5,
            onend: function () {
                console.log('Finished!');
            }
        });
        setSound(howler)
    }, [])

    const setupVideo = async (video: HTMLVideoElement) => {
        await Promise.all(
            [
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models')
            ]
        )

        video.srcObject = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        });
        console.info('setup finished')
    }


    React.useEffect(() => {
        const videoElm = videoRef.current
        if (videoElm) setupVideo(videoElm)
    }, [])

    const playSound = React.useCallback(() => {
        sound?.play()
    }, [sound])

    const stopSound = React.useCallback(() => {
        sound?.stop()
    }, [sound])

    const playVideo = React.useCallback(() => {
        const videoElm = videoRef.current
        videoElm?.play()
        if (!videoElm) return
        setInterval(async () => {
            const detection = await faceapi.detectSingleFace(videoElm, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceExpressions()
            console.log(detection)

            if (detection) {
                setScore(detection.detection.score)
                const index = 30
                setPoint({x: detection.landmarks.positions[index].x, y: detection.landmarks.positions[index].y})
                setArea(detection.detection.box.width)
                setNormalPoint(detection.expressions.neutral)
                setCanDetect(true)
            } else {
                setCanDetect(false)
            }
        }, 250)
    }, [])

    const scale = React.useMemo(() => {
        return ( area + 30 ) / 640
    }, [area])

    React.useEffect(() => {
        if (score > 0.50 && normalPoint > 0.8) {
            if (!isPlayingRef.current) {
                playSound()
                isPlayingRef.current = true
            }
        } else {
            stopSound()
            isPlayingRef.current = false
            setCanDetect(false)
        }
    }, [normalPoint, playSound, score, stopSound])

    return (
        <div className="App">
            <button onClick={playVideo}>
                play
            </button>
            <header className="App-header">
                <VideoWrapper>
                    <Item x={point.x} y={point.y}/>
                    <video width={640} height={480} ref={videoRef}/>
                    <Image src={John} scale={scale} width={640} x={point.x} y={point.y} data-can-detect={canDetect}/>
                </VideoWrapper>
            </header>
        </div>
    );
}

export default App;

const VideoWrapper = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
`

const Item = styled.div<{ x: number, y: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 5px;
  background-color:red;
  transform: translate(${props => props.x}px , ${props => props.y}px);
  opacity: 0;
`

const Image = styled.img<{ x: number, y: number, scale: number }>`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(${props => props.x}px , ${props => props.y}px) scale(${props => props.scale});
  opacity: 0;
  margin: -74% 0 0 -50%;
  &[data-can-detect='true'] {
      opacity: 1;
      transition: opacity 60s;
  }
`

